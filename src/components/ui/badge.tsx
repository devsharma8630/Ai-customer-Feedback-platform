import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-[rgb(var(--surface-border))] bg-[rgb(var(--surface)/0.6)] text-[var(--foreground)]",
        positive: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
        negative: "border-rose-500/20 bg-rose-500/10 text-rose-500",
        neutral: "border-amber-500/20 bg-amber-500/10 text-amber-500",
        gradient: "border-transparent text-white bg-[image:var(--accent-gradient)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
