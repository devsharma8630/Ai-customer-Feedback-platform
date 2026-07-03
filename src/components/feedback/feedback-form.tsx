"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFeedbackAction } from "@/actions/feedback.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("rating", String(rating || ""));
    startTransition(async () => {
      const result = await createFeedbackAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Feedback saved — AI analysis complete");
      router.push(`/feedback/${result.id}`);
    });
  }

  return (
    <Card className="max-w-2xl">
      <form action={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Customer name</Label>
            <Input id="customerName" name="customerName" placeholder="Jane Cooper" required />
          </div>
          <div>
            <Label htmlFor="customerEmail">Customer email</Label>
            <Input id="customerEmail" name="customerEmail" type="email" placeholder="jane@customer.com" />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input id="customerPhone" name="customerPhone" placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="product">Product</Label>
            <Input id="product" name="product" placeholder="e.g. Mobile App" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select id="channel" name="channel" defaultValue="manual_entry">
              <option value="manual_entry">Manual entry</option>
              <option value="website_form">Website form</option>
              <option value="email_import">Email import</option>
              <option value="csv_upload">CSV upload</option>
              <option value="qr_code">QR feedback</option>
              <option value="survey">Customer survey</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} star`}
                className="p-0.5"
              >
                <Star className={cn("h-6 w-6", n <= rating ? "fill-amber-400 text-amber-400" : "text-[var(--muted)]")} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="message">Feedback message</Label>
          <Textarea id="message" name="message" placeholder="What did the customer say?" required rows={5} />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" /> Saving &amp; running AI analysis…
            </>
          ) : (
            "Save feedback"
          )}
        </Button>
      </form>
    </Card>
  );
}
