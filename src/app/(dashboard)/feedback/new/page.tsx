import { FeedbackForm } from "@/components/feedback/feedback-form";

export default function NewFeedbackPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log feedback</h1>
        <p className="text-sm text-[var(--muted)]">
          Loop&apos;s AI will automatically analyze sentiment, emotion, and topics on save.
        </p>
      </div>
      <FeedbackForm />
    </div>
  );
}
