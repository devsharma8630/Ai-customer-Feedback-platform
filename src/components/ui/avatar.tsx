import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  className,
  size = 36,
}: {
  name: string;
  src?: string | null;
  className?: string;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--surface-border))] bg-[image:var(--accent-gradient)] text-xs font-semibold text-white shrink-0",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name || "?")
      )}
    </div>
  );
}
