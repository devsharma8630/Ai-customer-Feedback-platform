"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { analyzeFeedback } from "@/lib/ai/openai";
import { z } from "zod";

const publicFeedbackSchema = z.object({
  companySlug: z.string().min(1),
  customerName: z.string().min(1, "Please tell us your name"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  product: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  message: z.string().min(3, "Please share a bit more detail"),
  channel: z.enum(["website_form", "qr_code", "survey"]).default("website_form"),
});

export async function submitPublicFeedbackAction(formData: FormData) {
  const parsed = publicFeedbackSchema.safeParse({
    companySlug: formData.get("companySlug"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    product: formData.get("product"),
    rating: formData.get("rating") || undefined,
    message: formData.get("message"),
    channel: formData.get("channel") || "website_form",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const supabase = createServiceClient();

  // Service-role lookup — public form has no session, so RLS can't be used here.
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", data.companySlug)
    .is("deleted_at", null)
    .single();

  if (!company) {
    return { error: "This feedback form is no longer available." };
  }

  // find-or-create customer
  let customerId: string | null = null;
  if (data.customerEmail) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("company_id", company.id)
      .eq("email", data.customerEmail)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("customers")
        .insert({ company_id: company.id, name: data.customerName, email: data.customerEmail || null })
        .select("id")
        .single();
      customerId = created?.id ?? null;
    }
  }

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      company_id: company.id,
      customer_id: customerId,
      customer_name: data.customerName,
      customer_email: data.customerEmail || null,
      product: data.product || null,
      rating: data.rating ?? null,
      message: data.message,
      channel: data.channel,
    })
    .select()
    .single();

  if (error || !feedback) {
    return { error: "We couldn't submit your feedback. Please try again." };
  }

  // Best-effort AI enrichment — never block the customer's submission on this.
  try {
    const result = await analyzeFeedback(data.message, { product: data.product, rating: data.rating });
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
        priority: result.is_urgent ? "urgent" : "medium",
      })
      .eq("id", feedback.id);

    await supabase.from("ai_usage_log").insert({ company_id: company.id, feature: "sentiment_analysis" });
  } catch {
    // customer already has their confirmation — analysis can be retried from the dashboard
  }

  return { success: true };
}

export async function getCompanyBySlug(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("companies")
    .select("id, name, logo_url")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();
  return data;
}
