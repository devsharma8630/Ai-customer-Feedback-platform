import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquareText, BarChart3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI reads every response",
    body: "Sentiment, emotion, urgency, and root cause — extracted automatically the moment feedback arrives, in any language.",
  },
  {
    icon: MessageSquareText,
    title: "Ask Loop directly",
    body: "\"What are customers unhappy about this month?\" Loop answers from your live data, not a static report.",
  },
  {
    icon: BarChart3,
    title: "One dashboard, every signal",
    body: "NPS, sentiment trend, department performance, and top complaints — updated in real time as feedback comes in.",
  },
  {
    icon: ShieldCheck,
    title: "Built for multiple teams",
    body: "Company-isolated data, role-based access, and audit trails so every team sees exactly what they should.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[image:var(--accent-gradient)] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          Loop
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--surface-border))] px-3 py-1 text-xs text-[var(--muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-violet)]" />
          Powered by Gemini
        </div>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Every customer voice,
          <br />
          <span className="gradient-text">turned into a clear next step.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
          Loop collects feedback from every channel, has AI analyze it in seconds, and tells your
          team exactly what to fix first — so nothing important gets lost in a spreadsheet again.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="text-left">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[image:var(--accent-gradient)] text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold">{f.title}</h3>
              <p className="text-sm text-[var(--muted)]">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Loop. Built for teams who listen.
      </footer>
    </div>
  );
}
