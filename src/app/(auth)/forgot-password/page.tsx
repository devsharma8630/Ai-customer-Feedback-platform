import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Reset your password</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">We&apos;ll email you a link to get back in.</p>
      <ForgotPasswordForm />
    </div>
  );
}
