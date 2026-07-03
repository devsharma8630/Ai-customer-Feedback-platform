import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-[0_4px_20px_-4px_rgba(110,92,246,0.6)] hover:shadow-[0_6px_24px_-4px_rgba(110,92,246,0.75)] hover:-translate-y-0.5 bg-[image:var(--accent-gradient)]",
        secondary:
          "glass-panel hover:bg-[rgb(var(--surface)/0.9)] text-[var(--foreground)]",
        outline:
          "border border-[rgb(var(--surface-border))] bg-transparent hover:bg-[rgb(var(--surface)/0.5)] text-[var(--foreground)]",
        ghost: "hover:bg-[rgb(var(--surface)/0.6)] text-[var(--foreground)]",
        destructive: "bg-rose-500 text-white hover:bg-rose-600",
        link: "text-[var(--accent-violet)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-md)] px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
