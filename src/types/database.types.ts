export type UserRole = "super_admin" | "company_admin" | "manager" | "employee";

export type FeedbackChannel =
  | "website_form"
  | "email_import"
  | "csv_upload"
  | "manual_entry"
  | "qr_code"
  | "survey";

export type FeedbackStatus = "new" | "in_review" | "in_progress" | "resolved" | "closed" | "spam";
export type FeedbackPriority = "low" | "medium" | "high" | "urgent";
export type FeedbackSentiment = "positive" | "negative" | "neutral";
export type FeedbackEmotion = "happy" | "angry" | "excited" | "frustrated" | "confused" | "neutral";
export type SubscriptionPlan = "trial" | "starter" | "growth" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  website: string | null;
  plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  ai_monthly_quota: number;
  ai_usage_this_month: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
  department_id: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  lead_id: string | null;
  created_at: string;
}

export interface FeedbackCategory {
  id: string;
  company_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  total_feedback_count: number;
  average_rating: number | null;
  first_seen_at: string;
  last_feedback_at: string | null;
  metadata: Record<string, unknown>;
}

export interface Feedback {
  id: string;
  company_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  product: string | null;
  category_id: string | null;
  department_id: string | null;
  rating: number | null;
  message: string;
  location: string | null;
  channel: FeedbackChannel;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  tags: string[];
  ai_sentiment: FeedbackSentiment | null;
  ai_emotion: FeedbackEmotion | null;
  ai_topics: string[] | null;
  ai_keywords: string[] | null;
  ai_is_complaint: boolean | null;
  ai_is_feature_request: boolean | null;
  ai_is_spam: boolean | null;
  ai_is_urgent: boolean | null;
  ai_language: string | null;
  ai_summary: string | null;
  ai_root_cause: string | null;
  ai_recommended_action: string | null;
  ai_confidence: number | null;
  ai_analyzed_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackReply {
  id: string;
  feedback_id: string;
  author_id: string | null;
  message: string;
  is_ai_suggested: boolean;
  sent_to_customer: boolean;
  created_at: string;
}

export interface FeedbackActivity {
  id: string;
  feedback_id: string;
  actor_id: string | null;
  action: string;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AIAnalysisResult {
  sentiment: FeedbackSentiment;
  emotion: FeedbackEmotion;
  topics: string[];
  keywords: string[];
  is_complaint: boolean;
  is_feature_request: boolean;
  is_spam: boolean;
  is_urgent: boolean;
  language: string;
  summary: string;
  root_cause: string;
  recommended_action: string;
  confidence: number;
}

export interface DashboardStats {
  total_feedback: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  nps_score: number;
  average_rating: number;
  trend: { date: string; count: number; positive: number; negative: number; neutral: number }[];
  department_performance: { department: string; avg_rating: number; count: number }[];
  top_products: { product: string; count: number }[];
  top_complaints: { topic: string; count: number }[];
  top_feature_requests: { topic: string; count: number }[];
}
