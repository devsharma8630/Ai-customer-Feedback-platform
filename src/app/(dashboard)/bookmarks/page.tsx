import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { FeedbackTable } from "@/components/feedback/feedback-table";
import { Card } from "@/components/ui/card";
import type { Feedback } from "@/types/database.types";

export default async function BookmarksPage() {
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("feedback_id")
    .eq("user_id", profile?.id ?? "");

  const ids = (bookmarks ?? []).map((b) => b.feedback_id);

  let rows: Feedback[] = [];
  if (ids.length > 0) {
    const { data } = await supabase.from("feedback").select("*").in("id", ids).order("created_at", { ascending: false });
    rows = (data ?? []) as Feedback[];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="text-sm text-[var(--muted)]">Feedback you&apos;ve pinned for later.</p>
      </div>
      {rows.length === 0 ? (
        <Card className="py-16 text-center text-sm text-[var(--muted)]">
          Bookmark feedback from its detail page to find it here quickly.
        </Card>
      ) : (
        <FeedbackTable rows={rows} />
      )}
    </div>
  );
}
