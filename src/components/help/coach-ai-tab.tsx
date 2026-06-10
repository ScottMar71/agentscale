"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHelp } from "@/components/help/help-provider";
import { getHelpTopic } from "@/lib/help/topics";
import { cn } from "@/lib/utils";
import type { CoachMessage } from "@/lib/openai/coach";

const DEFAULT_PROMPTS = [
  "What does certification coverage mean?",
  "How do I improve pilot success metrics?",
  "What should I do after registering my first agent?",
];

export function CoachAiTab() {
  const pathname = usePathname();
  const { role, activeTopicId, coachOpen } = useHelp();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTopic = activeTopicId ? getHelpTopic(activeTopicId) : null;

  const suggestedPrompts = activeTopic
    ? [`Explain ${activeTopic.title}`, ...DEFAULT_PROMPTS.slice(0, 2)]
    : DEFAULT_PROMPTS;

  useEffect(() => {
    if (!coachOpen) {
      setMessages([]);
      setInput("");
      setError(null);
      setLoading(false);
    }
  }, [coachOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");
    const userMessage: CoachMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          topicId: activeTopicId ?? undefined,
          pathname,
          role,
          history: messages,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Coach request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((current) => [...current, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        const snapshot = assistantText;
        setMessages((current) => {
          const updated = [...current];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { role: "assistant", content: snapshot };
          }
          return updated;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((current) => {
        const updated = [...current];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant" && !last.content) updated.pop();
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ask about metrics, workflows, or what to do next on this page. Answers are grounded in
              the Platform Coach help library.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-8 bg-primary text-primary-foreground"
                    : "mr-4 bg-muted text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="mr-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Thinking…
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <form
        className="border-t border-border px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
      >
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask the Platform Coach…"
            disabled={loading}
            aria-label="Message for Platform Coach"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
            <Send className="size-4" aria-hidden />
          </Button>
        </div>
      </form>
    </div>
  );
}
