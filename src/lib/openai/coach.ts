import OpenAI from "openai";
import { formatHelpTopicForPrompt } from "@/lib/help/format-topic";
import { retrieveCoachTopics } from "@/lib/help/retrieve-topics";
import type { HelpTopic } from "@/lib/help/types";
import type { OrgRole } from "@/types";

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachRequest {
  message: string;
  topicId?: string;
  pathname?: string;
  role?: OrgRole | null;
  history?: CoachMessage[];
}

function buildSystemPrompt(
  topics: HelpTopic[],
  role: OrgRole | null | undefined,
  pathname: string | undefined
): string {
  const roleLabel = role ?? "unknown (demo or unauthenticated)";
  const context = topics.map(formatHelpTopicForPrompt).join("\n\n");

  return `You are the AgentScale Platform Coach — a concise, accurate assistant for the AgentScale AI workforce platform.

Rules:
- Answer ONLY using the help topics provided below and general AgentScale navigation facts implied by them.
- If the answer is not covered by the topics, say you do not have that information and suggest opening the relevant module or contacting an org admin.
- Be brief: 2–4 short paragraphs or a short bullet list. No markdown headings.
- When suggesting actions, only recommend steps the user's role can perform.
- User role: ${roleLabel}
- Current page: ${pathname ?? "unknown"}

Help topics:
${context}`;
}

function buildMockReply(topics: HelpTopic[], message: string): string {
  if (topics.length === 0) {
    return "I could not find a matching help topic. Try asking about a specific dashboard metric, such as certification coverage or scenario pass rate.";
  }

  const primary = topics[0];
  const parts = [
    `${primary.summary}`,
    primary.formula ? `Formula: ${primary.formula}` : null,
    primary.targets ? `Target: ${primary.targets}` : null,
    primary.improveSteps?.length
      ? `Next step: ${primary.improveSteps[0].label}.`
      : null,
    "Live AI answers require OPENAI_API_KEY — this is a demo response from the help library.",
  ].filter(Boolean);

  if (message.toLowerCase().includes("pilot")) {
    return "Pilot success metrics track days since first agent, days to first certification, average onboarding completion, and scenario pass rate. Open the Executive Dashboard to see them when your org has data.";
  }

  return parts.join(" ");
}

export function retrieveCoachContext(request: CoachRequest): HelpTopic[] {
  return retrieveCoachTopics({
    message: request.message,
    topicId: request.topicId,
    pathname: request.pathname,
  });
}

export async function streamCoachReply(
  request: CoachRequest,
  topics: HelpTopic[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY;
  const encoder = new TextEncoder();

  if (!apiKey) {
    const text = buildMockReply(topics, request.message);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });
  }

  const openai = new OpenAI({ apiKey });
  const system = buildSystemPrompt(topics, request.role, request.pathname);
  const history = (request.history ?? []).slice(-6);

  const stream = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    stream: true,
    messages: [
      { role: "system", content: system },
      ...history.map((entry) => ({ role: entry.role, content: entry.content })),
      { role: "user", content: request.message },
    ],
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
