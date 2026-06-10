import type { HelpTopic } from "@/lib/help/types";

export function formatHelpTopicForPrompt(topic: HelpTopic): string {
  const lines = [
    `### ${topic.title} (${topic.id})`,
    `Category: ${topic.category}`,
    `Summary: ${topic.summary}`,
  ];

  if (topic.definition) lines.push(`Definition: ${topic.definition}`);
  if (topic.dataSource) lines.push(`Data source: ${topic.dataSource}`);
  if (topic.targets) lines.push(`Target: ${topic.targets}`);
  if (topic.appearsOn?.length) lines.push(`Appears on: ${topic.appearsOn.join(", ")}`);

  if (topic.improveSteps?.length) {
    lines.push(
      "Suggested actions:",
      ...topic.improveSteps.map((step) => `- ${step.label} (${step.href})`)
    );
  }

  return lines.join("\n");
}
