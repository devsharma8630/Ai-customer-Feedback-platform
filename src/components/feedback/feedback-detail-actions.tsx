"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";
import {
  updateFeedbackStatusAction,
  generateAIReplyAction,
  sendReplyAction,
  runAIAnalysis,
} from "@/actions/feedback.actions";
import { useRouter } from "next/navigation";

export function StatusControl({ feedbackId, status }: { feedbackId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        startTransition(async () => {
          const result = await updateFeedbackStatusAction(feedbackId, e.target.value);
          if (result?.error) toast.error(result.error);
          else {
            toast.success("Status updated");
            router.refresh();
          }
        });
      }}
    >
      <option value="new">New</option>
      <option value="in_review">In review</option>
      <option value="in_progress">In progress</option>
      <option value="resolved">Resolved</option>
      <option value="closed">Closed</option>
      <option value="spam">Spam</option>
    </Select>
  );
}

export function ReanalyzeButton({ feedbackId }: { feedbackId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await runAIAnalysis(feedbackId);
          if (result?.error) toast.error(result.error);
          else {
            toast.success("AI analysis refreshed");
            router.refresh();
          }
        })
      }
    >
      <Sparkles className="h-3.5 w-3.5" /> {isPending ? "Analyzing…" : "Re-run AI analysis"}
    </Button>
  );
}

export function ReplyPanel({ feedbackId }: { feedbackId: string }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function suggest() {
    startTransition(async () => {
      const result = await generateAIReplyAction(feedbackId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.reply) {
        setMessage(result.reply);
        router.refresh();
      }
    });
  }

  function send() {
    if (!message.trim()) return;
    startTransition(async () => {
      const result = await sendReplyAction(feedbackId, message);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.reason) {
        toast.warning(result.reason);
        setMessage("");
        router.refresh();
      } else {
        toast.success("Reply emailed to customer");
        setMessage("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a reply, or let AI suggest one…"
        rows={4}
      />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={suggest} disabled={isPending}>
          <Sparkles className="h-3.5 w-3.5" /> AI suggest reply
        </Button>
        <Button size="sm" onClick={send} disabled={isPending || !message.trim()}>
          <Send className="h-3.5 w-3.5" /> Send
        </Button>
      </div>
    </div>
  );
}
