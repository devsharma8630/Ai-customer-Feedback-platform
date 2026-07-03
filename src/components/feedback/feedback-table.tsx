import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SentimentBadge } from "@/components/feedback/ai-insight-badge";
import { formatRelativeTime, priorityColor } from "@/lib/utils";
import { Star } from "lucide-react";
import type { Feedback } from "@/types/database.types";
import { cn } from "@/lib/utils";

export function FeedbackTable({ rows }: { rows: Feedback[] }) {
  if (rows.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-medium">No feedback matches these filters</p>
        <p className="text-sm text-[var(--muted)]">Try widening your date range or clearing filters.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[rgb(var(--surface-border))] text-left text-xs text-[var(--muted)]">
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Feedback</th>
            <th className="px-5 py-3 font-medium">Rating</th>
            <th className="px-5 py-3 font-medium">Sentiment</th>
            <th className="px-5 py-3 font-medium">Priority</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.id} className="border-b border-[rgb(var(--surface-border))] last:border-0 hover:bg-[rgb(var(--surface)/0.5)]">
              <td className="px-5 py-3">
                <Link href={`/feedback/${f.id}`} className="flex items-center gap-2.5">
                  <Avatar name={f.customer_name} size={28} />
                  <span className="font-medium">{f.customer_name}</span>
                </Link>
              </td>
              <td className="max-w-xs px-5 py-3 text-[var(--muted)]">
                <Link href={`/feedback/${f.id}`} className="line-clamp-1">
                  {f.ai_summary || f.message}
                </Link>
              </td>
              <td className="px-5 py-3">
                {f.rating ? (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {f.rating}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-5 py-3">
                <SentimentBadge sentiment={f.ai_sentiment} />
              </td>
              <td className="px-5 py-3">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs capitalize", priorityColor(f.priority))}>
                  {f.priority}
                </span>
              </td>
              <td className="px-5 py-3">
                <Badge className="capitalize">{f.status.replace("_", " ")}</Badge>
              </td>
              <td className="px-5 py-3 text-xs text-[var(--muted)]">{formatRelativeTime(f.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
