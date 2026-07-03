import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeFeedback } from "@/lib/ai/openai";
import { z } from "zod";

// Allow this endpoint to be called from any origin — it's designed to be used
// by standalone widgets/forms hosted on a different domain than the main app.
// Tighten this to specific domains via CORS_ALLOWED_ORIGIN if you want to
// restrict which sites can submit feedback into your workspace.
function corsHeaders() {
  const origin = process.env.CORS_ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

const schema = z.object({
  companySlug: z.string().min(1),
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  product: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  message: z.string().min(3, "Message is too short"),
  channel: z.enum(["website_form", "qr_code", "survey"]).default("website_form"),
});

export async function POST(req: NextRequest) {
  const headers = corsHeaders();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400, headers });
  }

  const data = parsed.data;
  const supabase = createServiceClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", data.companySlug)
    .is("deleted_at", null)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Unknown company" }, { status: 404, headers });
  }

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
    return NextResponse.json({ error: "Could not save feedback" }, { status: 500, headers });
  }

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
    // Submission already succeeded for the customer; analysis can be retried from the dashboard.
  }

  return NextResponse.json({ success: true, id: feedback.id }, { status: 200, headers });
}
