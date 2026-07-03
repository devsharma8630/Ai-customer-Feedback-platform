import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Create your workspace</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Start turning feedback into action, free.</p>
      <SignupForm />
    </div>
  );
}
