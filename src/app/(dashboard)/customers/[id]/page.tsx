import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SentimentBadge } from "@/components/feedback/ai-insight-badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Star, Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { Customer, Feedback } from "@/types/database.types";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();
  const c = customer as Customer;

  const { data: history } = await supabase
    .from("feedback")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const feedbackHistory = (history ?? []) as Feedback[];

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={c.name} src={c.avatar_url} size={56} />
          <div>
            <h1 className="text-lg font-semibold">{c.name}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
              {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>}
              {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-xl font-semibold">{c.total_feedback_count}</p>
            <p className="text-xs text-[var(--muted)]">Feedback</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xl font-semibold">
              {c.average_rating ?? "—"} {c.average_rating && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            </p>
            <p className="text-xs text-[var(--muted)]">Avg rating</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{formatDate(c.first_seen_at)}</p>
            <p className="text-xs text-[var(--muted)]">Customer since</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback timeline</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {feedbackHistory.length === 0 && <p className="text-sm text-[var(--muted)]">No feedback yet.</p>}
          {feedbackHistory.map((f) => (
            <Link
              key={f.id}
              href={`/feedback/${f.id}`}
              className="block rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] p-4 hover:border-[var(--accent-violet)]"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <SentimentBadge sentiment={f.ai_sentiment} />
                <span className="text-xs text-[var(--muted)]">{formatRelativeTime(f.created_at)}</span>
              </div>
              <p className="line-clamp-2 text-sm">{f.message}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
