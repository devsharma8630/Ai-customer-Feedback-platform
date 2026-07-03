"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateAIReportAction } from "@/actions/reports.actions";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const TYPES: { type: "weekly" | "monthly" | "voice_of_customer" | "executive_summary"; label: string }[] = [
  { type: "weekly", label: "Weekly report" },
  { type: "monthly", label: "Monthly report" },
  { type: "voice_of_customer", label: "Voice of Customer" },
  { type: "executive_summary", label: "Executive summary" },
];

export function ReportGeneratorButtons() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((t) => (
        <Button
          key={t.type}
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await generateAIReportAction(t.type);
              if (result?.error) toast.error(result.error);
              else {
                toast.success(`${t.label} generated`);
                router.refresh();
              }
            })
          }
        >
          <Sparkles className="h-3.5 w-3.5" /> {t.label}
        </Button>
      ))}
    </div>
  );
}
