"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SettingsForm({
  action,
  successMessage,
  children,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | undefined>;
  successMessage: string;
  children: React.ReactNode;
  submitLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(successMessage);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {children}
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
