"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { generateReport } from "@/lib/ai/openai";
import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";

type ReportType = "weekly" | "monthly" | "voice_of_customer" | "executive_summary";

export async function generateAIReportAction(type: ReportType) {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return { error: "No company found" };

  const supabase = await createClient();
  const days = type === "weekly" ? 7 : 30;
  const since = subDays(new Date(), days).toISOString();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("message, rating, ai_sentiment, ai_topics")
    .eq("company_id", profile.company_id)
    .gte("created_at", since)
    .limit(300);

  if (!feedback || feedback.length === 0) {
    return { error: "Not enough feedback in this period to generate a report" };
  }

  const normalized = feedback.map((f) => ({
    message: f.message,
    rating: f.rating,
    sentiment: f.ai_sentiment,
    topics: f.ai_topics,
  }));

  const content = await generateReport(type, normalized);

  const { data: report, error } = await supabase
    .from("ai_reports")
    .insert({
      company_id: profile.company_id,
      type,
      period_start: since.slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
      content,
      generated_by: profile.id,
    })
    .select()
    .single();

  if (error) return { error: "Could not save report" };

  await supabase.from("ai_usage_log").insert({ company_id: profile.company_id, feature: "report_generation" });

  revalidatePath("/reports");
  return { success: true, report };
}
