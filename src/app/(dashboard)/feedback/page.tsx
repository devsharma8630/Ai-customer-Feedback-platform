import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { FeedbackTable } from "@/components/feedback/feedback-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Feedback } from "@/types/database.types";

export default async function FeedbackListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sentiment?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  let query = supabase
    .from("feedback")
    .select("*")
    .eq("company_id", profile?.company_id ?? "")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status) query = query.eq("status", params.status);
  if (params.sentiment) query = query.eq("ai_sentiment", params.sentiment);
  if (params.priority) query = query.eq("priority", params.priority);
  if (params.q) query = query.textSearch("message", params.q, { type: "websearch" });

  const { data } = await query;
  const rows = (data ?? []) as Feedback[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
          <p className="text-sm text-[var(--muted)]">{rows.length} results</p>
        </div>
        <Link href="/feedback/new">
          <Button>
            <Plus className="h-4 w-4" /> Log feedback
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-3">
        <input type="hidden" name="q" value={params.q ?? ""} />
        <Select name="status" defaultValue={params.status ?? ""} className="w-40">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_review">In review</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="spam">Spam</option>
        </Select>
        <Select name="sentiment" defaultValue={params.sentiment ?? ""} className="w-40">
          <option value="">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </Select>
        <Select name="priority" defaultValue={params.priority ?? ""} className="w-40">
          <option value="">All priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Button variant="secondary" type="submit">Apply filters</Button>
      </form>

      <FeedbackTable rows={rows} />
    </div>
  );
}
