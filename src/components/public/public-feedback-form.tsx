"use client";

import { useState, useTransition } from "react";
import { submitPublicFeedbackAction } from "@/actions/public-feedback.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicFeedbackForm({
  companySlug,
  companyName,
  channel,
}: {
  companySlug: string;
  companyName: string;
  channel: "website_form" | "qr_code";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("companySlug", companySlug);
    formData.set("channel", channel);
    formData.set("rating", String(rating || ""));
    startTransition(async () => {
      const result = await submitPublicFeedbackAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h2 className="text-lg font-semibold">Thank you!</h2>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          Your feedback has been sent to the {companyName} team. We appreciate you taking the time to share it.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold">Share your feedback</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{companyName} would love to hear from you</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Label className="mb-0">How was your experience?</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} star`}
                className="p-0.5"
              >
                <Star className={cn("h-8 w-8 transition-colors", n <= rating ? "fill-amber-400 text-amber-400" : "text-[var(--muted)]")} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="customerName">Your name</Label>
          <Input id="customerName" name="customerName" placeholder="Jane Cooper" required />
        </div>
        <div>
          <Label htmlFor="customerEmail">Email (optional)</Label>
          <Input id="customerEmail" name="customerEmail" type="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="product">What is this about? (optional)</Label>
          <Input id="product" name="product" placeholder="e.g. Mobile App, Checkout, Support" />
        </div>
        <div>
          <Label htmlFor="message">Your feedback</Label>
          <Textarea id="message" name="message" placeholder="Tell us what's on your mind…" required rows={5} />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" /> Submitting…
            </>
          ) : (
            "Submit feedback"
          )}
        </Button>
        <p className="text-center text-[11px] text-[var(--muted)]">Powered by Loop</p>
      </form>
    </div>
  );
}
