import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] bg-[rgb(var(--surface)/0.5)] px-3 py-2 text-sm placeholder:text-[var(--muted)] outline-none transition-colors focus:border-[var(--accent-violet)] disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
