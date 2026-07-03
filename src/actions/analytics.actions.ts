"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { DashboardStats } from "@/types/database.types";
import { subDays, format } from "date-fns";

export async function getDashboardStats(rangeDays = 30): Promise<DashboardStats | null> {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return null;

  const supabase = await createClient();
  const since = subDays(new Date(), rangeDays).toISOString();

  const { data: rows } = await supabase
    .from("feedback")
    .select("id, rating, ai_sentiment, created_at, department_id, product, ai_topics, ai_is_complaint, ai_is_feature_request")
    .eq("company_id", profile.company_id)
    .gte("created_at", since);

  const feedback = rows ?? [];
  const total = feedback.length;

  const positive = feedback.filter((f) => f.ai_sentiment === "positive").length;
  const negative = feedback.filter((f) => f.ai_sentiment === "negative").length;
  const neutral = feedback.filter((f) => f.ai_sentiment === "neutral").length;

  const ratings = feedback.filter((f) => f.rating != null).map((f) => f.rating as number);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const promoters = feedback.filter((f) => (f.rating ?? 0) >= 4).length;
  const detractors = feedback.filter((f) => (f.rating ?? 0) <= 2 && (f.rating ?? 0) > 0).length;
  const nps = total ? Math.round(((promoters - detractors) / total) * 100) : 0;

  // trend by day
  const trendMap = new Map<string, { count: number; positive: number; negative: number; neutral: number }>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const key = format(subDays(new Date(), i), "MMM d");
    trendMap.set(key, { count: 0, positive: 0, negative: 0, neutral: 0 });
  }
  for (const f of feedback) {
    const key = format(new Date(f.created_at), "MMM d");
    const bucket = trendMap.get(key);
    if (bucket) {
      bucket.count++;
      if (f.ai_sentiment === "positive") bucket.positive++;
      else if (f.ai_sentiment === "negative") bucket.negative++;
      else bucket.neutral++;
    }
  }

  // department performance
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("company_id", profile.company_id);

  const deptPerf = (departments ?? []).map((d) => {
    const deptFeedback = feedback.filter((f) => f.department_id === d.id);
    const deptRatings = deptFeedback.filter((f) => f.rating != null).map((f) => f.rating as number);
    return {
      department: d.name,
      avg_rating: deptRatings.length ? Number((deptRatings.reduce((a, b) => a + b, 0) / deptRatings.length).toFixed(2)) : 0,
      count: deptFeedback.length,
    };
  });

  // top products
  const productCounts = new Map<string, number>();
  for (const f of feedback) {
    if (f.product) productCounts.set(f.product, (productCounts.get(f.product) ?? 0) + 1);
  }
  const topProducts = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([product, count]) => ({ product, count }));

  // top complaint / feature-request topics
  const complaintTopics = new Map<string, number>();
  const featureTopics = new Map<string, number>();
  for (const f of feedback) {
    const topics = f.ai_topics ?? [];
    if (f.ai_is_complaint) topics.forEach((t: string) => complaintTopics.set(t, (complaintTopics.get(t) ?? 0) + 1));
    if (f.ai_is_feature_request) topics.forEach((t: string) => featureTopics.set(t, (featureTopics.get(t) ?? 0) + 1));
  }

  return {
    total_feedback: total,
    positive_pct: total ? Math.round((positive / total) * 100) : 0,
    negative_pct: total ? Math.round((negative / total) * 100) : 0,
    neutral_pct: total ? Math.round((neutral / total) * 100) : 0,
    nps_score: nps,
    average_rating: Number(avgRating.toFixed(2)),
    trend: [...trendMap.entries()].map(([date, v]) => ({ date, ...v })),
    department_performance: deptPerf,
    top_products: topProducts,
    top_complaints: [...complaintTopics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => ({ topic, count })),
    top_feature_requests: [...featureTopics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => ({ topic, count })),
  };
}
