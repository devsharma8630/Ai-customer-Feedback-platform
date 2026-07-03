import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Sign in to your Loop workspace</p>
      <LoginForm />
    </div>
  );
}
