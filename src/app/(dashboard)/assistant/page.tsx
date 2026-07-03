import { AIAssistantChat } from "@/components/dashboard/ai-assistant-chat";

export default function AssistantPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-[var(--muted)]">
          Ask questions about your feedback data and get answers grounded in what customers actually said.
        </p>
      </div>
      <AIAssistantChat />
    </div>
  );
}
