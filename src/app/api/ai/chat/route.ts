import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { askAssistant } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "A question is required" }, { status: 400 });
  }

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("message, rating, ai_sentiment, ai_topics, ai_summary, department_id, created_at")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })
    .limit(300);

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("company_id", profile.company_id);

  const deptNameById = new Map((departments ?? []).map((d) => [d.id, d.name]));

  const contextLines = (feedback ?? []).map(
    (f) =>
      `- [${f.created_at?.slice(0, 10)}] rating=${f.rating ?? "-"} sentiment=${f.ai_sentiment ?? "-"} dept=${
        f.department_id ? deptNameById.get(f.department_id) ?? "-" : "-"
      } topics=${(f.ai_topics ?? []).join(",")} :: ${f.ai_summary ?? f.message.slice(0, 140)}`
  );

  const dataContext =
    contextLines.length > 0
      ? contextLines.join("\n")
      : "No feedback has been recorded yet for this company.";

  const answer = await askAssistant(question, dataContext);

  await supabase.from("ai_usage_log").insert({
    company_id: profile.company_id,
    feature: "chat_assistant",
  });

  return NextResponse.json({ answer });
}
