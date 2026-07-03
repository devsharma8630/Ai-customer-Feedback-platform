import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Building2, Users, Sparkles, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = createServiceClient();

  const [{ data: companies }, { count: userCount }, { data: usage }] = await Promise.all([
    supabase.from("companies").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("ai_usage_log").select("company_id, feature").gte(
      "created_at",
      new Date(new Date().setDate(1)).toISOString()
    ),
  ]);

  const usageByCompany = new Map<string, number>();
  for (const row of usage ?? []) {
    usageByCompany.set(row.company_id, (usageByCompany.get(row.company_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform admin</h1>
        <p className="text-sm text-[var(--muted)]">Super admin — visibility across every company on Loop.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Companies" value={companies?.length ?? 0} icon={Building2} />
        <StatCard label="Total users" value={userCount ?? 0} icon={Users} />
        <StatCard label="AI calls this month" value={usage?.length ?? 0} icon={Sparkles} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>Subscription status and AI usage across tenants</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--surface-border))] text-left text-xs text-[var(--muted)]">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">AI usage (month)</th>
                <th className="py-2 pr-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(companies ?? []).map((c: any) => {
                const used = usageByCompany.get(c.id) ?? 0;
                const overQuota = used > c.ai_monthly_quota;
                return (
                  <tr key={c.id} className="border-b border-[rgb(var(--surface-border))] last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{c.name}</td>
                    <td className="py-2.5 pr-4 capitalize">{c.plan}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={c.subscription_status === "active" ? "positive" : c.subscription_status === "past_due" ? "negative" : "neutral"} className="capitalize">
                        {c.subscription_status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={overQuota ? "flex items-center gap-1 text-rose-500" : ""}>
                        {overQuota && <AlertTriangle className="h-3.5 w-3.5" />}
                        {used} / {c.ai_monthly_quota}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--muted)]">{formatDate(c.created_at)}</td>
                  </tr>
                );
              })}
              {(companies ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[var(--muted)]">No companies yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
