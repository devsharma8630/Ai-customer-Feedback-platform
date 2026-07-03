"use client";

import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(formData);
      if (result?.error) setError(result.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="h-10 w-10 text-[var(--accent-violet)]" />
        <h2 className="text-lg font-semibold">Reset link sent</h2>
        <p className="text-sm text-[var(--muted)]">
          If an account exists for that email, a password reset link is on its way.
        </p>
        <Link href="/login" className="text-sm text-[var(--accent-violet)] hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@company.com" required />
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        <Link href="/login" className="text-[var(--accent-violet)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
