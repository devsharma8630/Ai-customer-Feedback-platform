import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] bg-[rgb(var(--surface)/0.5)] px-3 py-2 text-sm placeholder:text-[var(--muted)] outline-none transition-colors focus:border-[var(--accent-violet)] disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
