"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What are customers unhappy about this month?",
  "What should we improve first?",
  "Top complaints this month",
  "Which department has the worst ratings?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer ?? data.error ?? "Something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the AI service. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-[70vh] flex-col p-0">
      <div className="flex items-center gap-2 border-b border-[rgb(var(--surface-border))] px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[image:var(--accent-gradient)] text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Loop AI Assistant</p>
          <p className="text-xs text-[var(--muted)]">Ask anything about your feedback data</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] p-3 text-left text-sm hover:border-[var(--accent-violet)]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                m.role === "assistant" ? "bg-[image:var(--accent-gradient)] text-white" : "bg-[rgb(var(--surface-border))]"
              )}
            >
              {m.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </span>
            <div
              className={cn(
                "max-w-[80%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm",
                m.role === "assistant"
                  ? "bg-[rgb(var(--surface)/0.7)] border border-[rgb(var(--surface-border))]"
                  : "bg-[image:var(--accent-gradient)] text-white"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Sparkles className="h-4 w-4 animate-pulse" /> Thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t border-[rgb(var(--surface-border))] p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your feedback…"
          className="h-10 flex-1 rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] bg-[rgb(var(--surface)/0.5)] px-3 text-sm outline-none focus:border-[var(--accent-violet)]"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
