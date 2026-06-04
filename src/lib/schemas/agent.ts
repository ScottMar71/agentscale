import { z } from "zod";

const agentStatus = z.enum([
  "draft",
  "onboarding",
  "active",
  "suspended",
  "archived",
]);
const riskLevel = z.enum(["low", "medium", "high", "critical"]);
const deploymentStatus = z.enum(["development", "staging", "production"]);

export const agentFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  description: z.string().max(2000).optional(),
  department: z.string().max(100).optional(),
  business_function: z.string().max(100).optional(),
  status: agentStatus,
  risk_level: riskLevel,
  deployment_status: deploymentStatus,
  model_provider: z.string().max(100).optional(),
  model_version: z.string().max(100).optional(),
  prompt_version: z.string().max(50).optional(),
  tags: z.string().max(500).optional(),
  tool_stack: z.string().max(500).optional(),
  knowledge_base_connected: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type AgentFormInput = z.infer<typeof agentFormSchema>;

export function parseTagsInput(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

export function parseToolStackInput(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export function formatTagsForInput(tags: string[]): string {
  return tags.join(", ");
}

export function formatToolStackForInput(tools: string[]): string {
  return tools.join(", ");
}
