import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SentimentBadge } from "@/components/feedback/ai-insight-badge";
import { StatusControl, ReanalyzeButton, ReplyPanel } from "@/components/feedback/feedback-detail-actions";
import { formatDate, formatRelativeTime, priorityColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Star, Mail, Phone, MapPin, Radio, Sparkles, AlertTriangle, Bot } from "lucide-react";
import type { Feedback, FeedbackReply } from "@/types/database.types";

export default async function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: feedback } = await supabase.from("feedback").select("*").eq("id", id).single();
  if (!feedback) notFound();
  const fb = feedback as Feedback;

  const { data: replies } = await supabase
    .from("feedback_replies")
    .select("*")
    .eq("feedback_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={fb.customer_name} size={44} />
              <div>
                <h1 className="text-lg font-semibold">{fb.customer_name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                  {fb.customer_email && (
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {fb.customer_email}</span>
                  )}
                  {fb.customer_phone && (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {fb.customer_phone}</span>
                  )}
                  {fb.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {fb.location}</span>
                  )}
                </div>
              </div>
            </div>
            {fb.rating && (
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < fb.rating! && "fill-amber-400")} />
                ))}
              </div>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed">{fb.message}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1"><Radio className="h-3 w-3" /> {fb.channel.replace("_", " ")}</span>
            <span>·</span>
            <span>{formatDate(fb.created_at)} ({formatRelativeTime(fb.created_at)})</span>
            {fb.product && (
              <>
                <span>·</span>
                <span>{fb.product}</span>
              </>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Replies and AI-suggested responses</CardDescription>
          </CardHeader>
          <div className="mb-4 space-y-3">
            {(replies ?? []).length === 0 && (
              <p className="text-sm text-[var(--muted)]">No replies yet.</p>
            )}
            {(replies ?? []).map((r: FeedbackReply) => (
              <div key={r.id} className="rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-[var(--muted)]">
                  {r.is_ai_suggested && (
                    <span className="flex items-center gap-1 text-[var(--accent-violet)]">
                      <Bot className="h-3 w-3" /> AI suggested
                    </span>
                  )}
                  {r.sent_to_customer && <Badge variant="positive">Sent to customer</Badge>}
                  <span>{formatRelativeTime(r.created_at)}</span>
                </div>
                <p className="text-sm">{r.message}</p>
              </div>
            ))}
          </div>
          <ReplyPanel feedbackId={fb.id} />
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Triage</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs text-[var(--muted)]">Status</p>
              <StatusControl feedbackId={fb.id} status={fb.status} />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-[var(--muted)]">Priority</p>
              <span className={cn("inline-block rounded-full border px-3 py-1 text-xs capitalize", priorityColor(fb.priority))}>
                {fb.priority}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent-violet)]" /> AI insights
            </CardTitle>
          </CardHeader>

          {fb.ai_analyzed_at ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <SentimentBadge sentiment={fb.ai_sentiment} />
                {fb.ai_emotion && <Badge className="capitalize">{fb.ai_emotion}</Badge>}
                {fb.ai_is_urgent && (
                  <Badge variant="negative">
                    <AlertTriangle className="h-3 w-3" /> Urgent
                  </Badge>
                )}
              </div>

              {fb.ai_summary && (
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--muted)]">Summary</p>
                  <p>{fb.ai_summary}</p>
                </div>
              )}

              {fb.ai_root_cause && (
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--muted)]">Root cause</p>
                  <p>{fb.ai_root_cause}</p>
                </div>
              )}

              {fb.ai_recommended_action && (
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--muted)]">Recommended action</p>
                  <p>{fb.ai_recommended_action}</p>
                </div>
              )}

              {!!fb.ai_topics?.length && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[var(--muted)]">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fb.ai_topics.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
                {fb.ai_is_complaint && <Badge variant="negative">Complaint</Badge>}
                {fb.ai_is_feature_request && <Badge variant="gradient">Feature request</Badge>}
                {fb.ai_is_spam && <Badge variant="neutral">Possible spam</Badge>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Analysis pending.</p>
          )}

          <div className="mt-4">
            <ReanalyzeButton feedbackId={fb.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}
