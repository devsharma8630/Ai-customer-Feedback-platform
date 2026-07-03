import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "default" | "positive" | "negative";
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[image:var(--accent-gradient)] text-white">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {trend && (
        <div
          className={cn(
            "mt-1 text-xs",
            accent === "positive" && "text-emerald-500",
            accent === "negative" && "text-rose-500",
            accent === "default" && "text-[var(--muted)]"
          )}
        >
          {trend}
        </div>
      )}
    </Card>
  );
}
