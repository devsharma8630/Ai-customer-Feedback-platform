import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { FeedbackSentiment } from "@/types/database.types";

export function SentimentBadge({ sentiment }: { sentiment: FeedbackSentiment | null }) {
  if (!sentiment) {
    return (
      <Badge>
        <Sparkles className="h-3 w-3 animate-pulse" /> Analyzing
      </Badge>
    );
  }
  const variant = sentiment === "positive" ? "positive" : sentiment === "negative" ? "negative" : "neutral";
  return <Badge variant={variant}>{sentiment}</Badge>;
}
