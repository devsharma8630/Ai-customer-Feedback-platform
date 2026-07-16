"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeFeedback, suggestReply } from "@/lib/ai/openai";
import { sendReplyEmail } from "@/lib/email/emailjs";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createFeedbackSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  product: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  message: z.string().min(3, "Feedback message is too short"),
  location: z.string().optional(),
  channel: z.string().optional(),
  departmentId: z.string().uuid().optional().or(z.literal("")),
});

export async function createFeedbackAction(formData: FormData) {
  const parsed = createFeedbackSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    product: formData.get("product"),
    rating: formData.get("rating") || undefined,
    message: formData.get("message"),
    location: formData.get("location"),
    channel: formData.get("channel") || "manual_entry",
    departmentId: formData.get("departmentId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return { error: "No company found for this account" };

  const supabase = await createClient();
  const data = parsed.data;

  // find-or-create customer
  let customerId: string | null = null;
  if (data.customerEmail) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("company_id", profile.company_id)
      .eq("email", data.customerEmail)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("customers")
        .insert({
          company_id: profile.company_id,
          name: data.customerName,
          email: data.customerEmail || null,
          phone: data.customerPhone || null,
        })
        .select("id")
        .single();
      customerId = created?.id ?? null;
    }
  }

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      company_id: profile.company_id,
      customer_id: customerId,
      customer_name: data.customerName,
      customer_email: data.customerEmail || null,
      customer_phone: data.customerPhone || null,
      product: data.product || null,
      rating: data.rating ?? null,
      message: data.message,
      location: data.location || null,
      channel: data.channel || "manual_entry",
      department_id: data.departmentId || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !feedback) {
    return { error: "Could not save feedback" };
  }

  // fire-and-forget AI analysis (awaited here so the record is enriched before redirect)
  try {
    await runAIAnalysis(feedback.id);
  } catch {
    // analysis failure shouldn't block feedback capture; it can be retried later
  }

  revalidatePath("/feedback");
  revalidatePath("/dashboard");
  return { success: true, id: feedback.id };
}

export async function runAIAnalysis(feedbackId: string) {
  const supabase = await createClient();
  const { data: fb } = await supabase.from("feedback").select("*").eq("id", feedbackId).single();
  if (!fb) return { error: "Feedback not found" };

  const result = await analyzeFeedback(fb.message, { product: fb.product, rating: fb.rating });

  await supabase
    .from("feedback")
    .update({
      ai_sentiment: result.sentiment,
      ai_emotion: result.emotion,
      ai_topics: result.topics,
      ai_keywords: result.keywords,
      ai_is_complaint: result.is_complaint,
      ai_is_feature_request: result.is_feature_request,
      ai_is_spam: result.is_spam,
      ai_is_urgent: result.is_urgent,
      ai_language: result.language,
      ai_summary: result.summary,
      ai_root_cause: result.root_cause,
      ai_recommended_action: result.recommended_action,
      ai_confidence: result.confidence,
      ai_analyzed_at: new Date().toISOString(),
      priority: result.is_urgent ? "urgent" : fb.priority,
    })
    .eq("id", feedbackId);

  await supabase.from("ai_usage_log").insert({
    company_id: fb.company_id,
    feature: "sentiment_analysis",
  });

  revalidatePath(`/feedback/${feedbackId}`);
  return { success: true, result };
}

export async function updateFeedbackStatusAction(feedbackId: string, status: string) {
  const supabase = await createClient();
  const { profile } = await getCurrentProfile();

  const { error } = await supabase.from("feedback").update({ status }).eq("id", feedbackId);
  if (error) return { error: "Could not update status" };

  await supabase.from("feedback_activity").insert({
    feedback_id: feedbackId,
    actor_id: profile?.id,
    action: `status_changed_to_${status}`,
  });

  revalidatePath(`/feedback/${feedbackId}`);
  revalidatePath("/feedback");
  return { success: true };
}

export async function assignFeedbackAction(feedbackId: string, assigneeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("feedback").update({ assigned_to: assigneeId }).eq("id", feedbackId);
  if (error) return { error: "Could not assign feedback" };

  revalidatePath(`/feedback/${feedbackId}`);
  return { success: true };
}

export async function generateAIReplyAction(feedbackId: string) {
  const supabase = await createClient();
  const { data: fb } = await supabase.from("feedback").select("*").eq("id", feedbackId).single();
  if (!fb) return { error: "Feedback not found" };

  const reply = await suggestReply(fb.message, fb.ai_sentiment ?? "neutral", fb.ai_summary ?? "");

  const { profile } = await getCurrentProfile();
  await supabase.from("feedback_replies").insert({
    feedback_id: feedbackId,
    author_id: profile?.id,
    message: reply,
    is_ai_suggested: true,
  });

  revalidatePath(`/feedback/${feedbackId}`);
  return { success: true, reply };
}

export async function sendReplyAction(feedbackId: string, message: string) {
  const supabase = await createClient();
  const { profile, company } = await getCurrentProfile();

  const { data: fb } = await supabase
    .from("feedback")
    .select("customer_name, customer_email")
    .eq("id", feedbackId)
    .single();

  if (!fb?.customer_email) {
    // Still log the reply internally, but there's no address to email.
    const { error } = await supabase.from("feedback_replies").insert({
      feedback_id: feedbackId,
      author_id: profile?.id,
      message,
      sent_to_customer: false,
    });
    if (error) return { error: "Could not save reply" };
    revalidatePath(`/feedback/${feedbackId}`);
    return { success: true, emailSkipped: true, reason: "This customer has no email on file." };
  }

  const emailResult = await sendReplyEmail({
    to: fb.customer_email,
    customerName: fb.customer_name,
    companyName: company?.name ?? "Our team",
    message,
  });

  const { error } = await supabase.from("feedback_replies").insert({
    feedback_id: feedbackId,
    author_id: profile?.id,
    message,
    sent_to_customer: emailResult.success,
  });

  if (error) return { error: "Could not save reply" };

  revalidatePath(`/feedback/${feedbackId}`);

  if (!emailResult.success) {
    return {
      success: true,
      emailSkipped: emailResult.skipped ?? false,
      reason: emailResult.skipped
        ? "Reply saved, but email sending isn't configured yet (add RESEND_API_KEY)."
        : `Reply saved, but the email failed to send: ${emailResult.error}`,
    };
  }

  return { success: true };
}
