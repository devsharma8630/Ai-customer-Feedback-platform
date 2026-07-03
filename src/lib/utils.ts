import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string | Date) {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function sentimentColor(sentiment: string | null) {
  switch (sentiment) {
    case "positive":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "negative":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    default:
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }
}

export function priorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "high":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "medium":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  }
}
