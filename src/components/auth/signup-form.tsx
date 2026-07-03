"use client";

import { useState, useTransition } from "react";
import { signUpAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"verify" | "loggedin" | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      if (result?.needsEmailVerification) {
        setDone("verify");
      } else {
        toast.success("Account created");
        router.push("/dashboard");
      }
    });
  }

  if (done === "verify") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <h2 className="text-lg font-semibold">Check your inbox</h2>
        <p className="text-sm text-[var(--muted)]">
          We sent a verification link to your email. Confirm it to activate your Loop workspace.
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
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" placeholder="Jordan Rivera" required />
      </div>
      <div>
        <Label htmlFor="companyName">Company name</Label>
        <Input id="companyName" name="companyName" placeholder="Acme Inc." required />
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" placeholder="you@company.com" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="At least 8 characters" required />
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating your workspace…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-violet)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
