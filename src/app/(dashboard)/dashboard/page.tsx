import { getDashboardStats } from "@/actions/analytics.actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart, SentimentPie, DepartmentBarChart } from "@/components/dashboard/charts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquareText, Smile, Frown, Star, TrendingUp, Building2, Package, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const stats = await getDashboardStats(30);

  if (!stats || stats.total_feedback === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[image:var(--accent-gradient)] text-white">
          <MessageSquareText className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold">No feedback yet</h2>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          Once feedback starts coming in, Loop&apos;s AI will analyze sentiment, emotion, and topics
          automatically — and this dashboard will come alive.
        </p>
        <Link href="/feedback/new">
          <Button>Log your first feedback</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Last 30 days, updated in real time</p>
        </div>
        <Link href="/feedback/new">
          <Button>Log feedback</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total feedback" value={stats.total_feedback} icon={MessageSquareText} />
        <StatCard
          label="Positive sentiment"
          value={`${stats.positive_pct}%`}
          icon={Smile}
          accent="positive"
          trend={`${stats.negative_pct}% negative`}
        />
        <StatCard label="NPS score" value={stats.nps_score} icon={TrendingUp} accent={stats.nps_score >= 0 ? "positive" : "negative"} />
        <StatCard label="Average rating" value={`${stats.average_rating} / 5`} icon={Star} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sentiment trend</CardTitle>
            <CardDescription>Positive vs. negative feedback volume over time</CardDescription>
          </CardHeader>
          <TrendChart data={stats.trend} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment split</CardTitle>
            <CardDescription>Share of all feedback</CardDescription>
          </CardHeader>
          <SentimentPie positive={stats.positive_pct} negative={stats.negative_pct} neutral={stats.neutral_pct} />
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Positive</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Negative</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Neutral</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Department performance</CardTitle>
              <CardDescription>Average rating by department</CardDescription>
            </div>
          </CardHeader>
          {stats.department_performance.length ? (
            <DepartmentBarChart data={stats.department_performance} />
          ) : (
            <p className="py-10 text-center text-sm text-[var(--muted)]">No departments configured yet</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Frown className="h-4 w-4" /> Top complaints</CardTitle>
            <CardDescription>AI-detected complaint themes</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {stats.top_complaints.length ? (
              stats.top_complaints.map((c) => (
                <div key={c.topic} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] px-3 py-2 text-sm">
                  <span className="capitalize">{c.topic}</span>
                  <Badge variant="negative">{c.count}</Badge>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-[var(--muted)]">No complaints detected</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Top feature requests</CardTitle>
            <CardDescription>AI-detected requests</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {stats.top_feature_requests.length ? (
              stats.top_feature_requests.map((c) => (
                <div key={c.topic} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] px-3 py-2 text-sm">
                  <span className="capitalize">{c.topic}</span>
                  <Badge variant="gradient">{c.count}</Badge>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-[var(--muted)]">No feature requests detected</p>
            )}
          </div>
        </Card>
      </div>

      {stats.top_products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Top products mentioned</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {stats.top_products.map((p) => (
              <Badge key={p.product}>{p.product} · {p.count}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
