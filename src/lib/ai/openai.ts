import OpenAI from "openai";
import type { AIAnalysisResult } from "@/types/database.types";

// OpenRouter exposes an OpenAI-compatible API, so the same SDK works —
// just point it at OpenRouter's base URL and use an OpenRouter model slug.
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    // Optional but recommended by OpenRouter for analytics/rate-limit attribution.
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Loop",
  },
});

// Any OpenRouter-supported model slug works here, e.g.:
// "openai/gpt-4o-mini", "anthropic/claude-3.5-haiku", "google/gemini-2.0-flash-001", "meta-llama/llama-3.3-70b-instruct"
const ANALYSIS_MODEL = "openai/gpt-4o-mini";

const ANALYSIS_SCHEMA_PROMPT = `You are the AI analysis engine for Project Loop, a customer feedback intelligence platform.
Analyze the customer feedback and return ONLY a raw JSON object (no markdown fences, no preamble) matching exactly this shape:

{
  "sentiment": "positive" | "negative" | "neutral",
  "emotion": "happy" | "angry" | "excited" | "frustrated" | "confused" | "neutral",
  "topics": string[],          // 1-5 short theme labels, e.g. "checkout flow", "customer support"
  "keywords": string[],        // 3-8 salient keywords/phrases from the text
  "is_complaint": boolean,
  "is_feature_request": boolean,
  "is_spam": boolean,
  "is_urgent": boolean,        // true if this needs attention within 24h
  "language": string,          // ISO 639-1 code, e.g. "en"
  "summary": string,           // one sentence, plain language
  "root_cause": string,        // best-guess underlying cause, empty string if not applicable
  "recommended_action": string,// concrete next step for the company
  "confidence": number         // 0 to 1
}`;

function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in AI response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function analyzeFeedback(message: string, context?: {
  product?: string | null;
  rating?: number | null;
}): Promise<AIAnalysisResult> {
  const contextLine = [
    context?.product ? `Product: ${context.product}` : null,
    context?.rating ? `Star rating given: ${context.rating}/5` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ANALYSIS_SCHEMA_PROMPT },
      {
        role: "user",
        content: `${contextLine ? contextLine + "\n" : ""}Feedback text:\n"""${message}"""`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = extractJson(text) as AIAnalysisResult;

  return {
    sentiment: parsed.sentiment ?? "neutral",
    emotion: parsed.emotion ?? "neutral",
    topics: parsed.topics ?? [],
    keywords: parsed.keywords ?? [],
    is_complaint: !!parsed.is_complaint,
    is_feature_request: !!parsed.is_feature_request,
    is_spam: !!parsed.is_spam,
    is_urgent: !!parsed.is_urgent,
    language: parsed.language ?? "en",
    summary: parsed.summary ?? "",
    root_cause: parsed.root_cause ?? "",
    recommended_action: parsed.recommended_action ?? "",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
  };
}

export async function suggestReply(feedbackMessage: string, sentiment: string, summary: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are drafting a customer support reply for Project Loop. Write a warm, professional, concise reply (3-5 sentences) that acknowledges the customer's experience and states a clear next step. Return only the reply text, no preamble.",
      },
      {
        role: "user",
        content: `Sentiment: ${sentiment}\nSummary: ${summary}\nOriginal feedback: """${feedbackMessage}"""`,
      },
    ],
  });

  return (completion.choices[0]?.message?.content ?? "").trim();
}

export async function generateReport(
  type: "weekly" | "monthly" | "voice_of_customer" | "executive_summary",
  feedbackSample: { message: string; rating: number | null; sentiment: string | null; topics: string[] | null }[]
): Promise<{ title: string; summary: string; highlights: string[]; recommendations: string[] }> {
  const digest = feedbackSample
    .slice(0, 200)
    .map((f, i) => `${i + 1}. [${f.sentiment ?? "unknown"}, ${f.rating ?? "-"}★] ${f.message}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate a ${type.replace(/_/g, " ")} report for a company's customer feedback dashboard, based on the feedback entries provided.
Return ONLY raw JSON: { "title": string, "summary": string, "highlights": string[], "recommendations": string[] }.
Highlights and recommendations should each have 3-6 concise, specific items grounded in the data.`,
      },
      { role: "user", content: `Feedback entries:\n${digest}` },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  return extractJson(text) as {
    title: string;
    summary: string;
    highlights: string[];
    recommendations: string[];
  };
}

export async function askAssistant(question: string, dataContext: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are the Loop AI Assistant, embedded in a customer feedback intelligence dashboard. Answer the owner's question using ONLY the data context provided. Be specific, cite numbers where possible, and keep the answer under 200 words. If the data doesn't contain enough to answer, say so plainly.",
      },
      { role: "user", content: `Data context:\n${dataContext}\n\nQuestion: ${question}` },
    ],
  });

  return (completion.choices[0]?.message?.content ?? "").trim();
}