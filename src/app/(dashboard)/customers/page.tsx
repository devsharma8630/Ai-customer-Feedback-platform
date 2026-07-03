import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { Customer } from "@/types/database.types";

export default async function CustomersPage() {
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("company_id", profile?.company_id ?? "")
    .order("last_feedback_at", { ascending: false, nullsFirst: false })
    .limit(100);

  const customers = (data ?? []) as Customer[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-[var(--muted)]">{customers.length} customers on file</p>
      </div>

      {customers.length === 0 ? (
        <Card className="py-16 text-center text-sm text-[var(--muted)]">
          Customers appear here automatically once feedback with an email address is logged.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <Card className="h-full">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={c.name} src={c.avatar_url} size={40} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-[var(--muted)]">{c.email ?? "No email on file"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">{c.total_feedback_count} feedback</span>
                  {c.average_rating != null && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {c.average_rating}
                    </span>
                  )}
                </div>
                {c.last_feedback_at && (
                  <p className="mt-2 text-xs text-[var(--muted)]">Last feedback {formatRelativeTime(c.last_feedback_at)}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
