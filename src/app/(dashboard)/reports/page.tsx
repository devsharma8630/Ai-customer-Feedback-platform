import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportGeneratorButtons } from "@/components/dashboard/report-generator-buttons";
import { formatDate } from "@/lib/utils";

interface ReportContent {
  title: string;
  summary: string;
  highlights: string[];
  recommendations: string[];
}

export default async function ReportsPage() {
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("company_id", profile?.company_id ?? "")
    .order("created_at", { ascending: false })
    .limit(20);

  const reports = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-[var(--muted)]">AI-generated summaries of your feedback, ready to export or share.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate a new report</CardTitle>
          <CardDescription>Gemini analyzes your recent feedback and drafts it for you</CardDescription>
        </CardHeader>
        <ReportGeneratorButtons />
      </Card>

      <div className="space-y-4">
        {reports.length === 0 && (
          <Card className="py-16 text-center text-sm text-[var(--muted)]">No reports generated yet.</Card>
        )}
        {reports.map((r) => {
          const content = r.content as ReportContent;
          return (
            <Card key={r.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{content.title}</CardTitle>
                  <CardDescription>
                    {formatDate(r.period_start)} – {formatDate(r.period_end)}
                  </CardDescription>
                </div>
                <Badge variant="gradient" className="capitalize">{r.type.replace(/_/g, " ")}</Badge>
              </CardHeader>
              <p className="mb-4 text-sm">{content.summary}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--muted)]">Highlights</p>
                  <ul className="space-y-1.5 text-sm">
                    {content.highlights?.map((h, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[var(--accent-violet)]">•</span>{h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--muted)]">Recommendations</p>
                  <ul className="space-y-1.5 text-sm">
                    {content.recommendations?.map((h, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[var(--accent-cyan)]">•</span>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
