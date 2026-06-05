import { z } from "zod";

export const scenarioFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  prompt: z.string().min(10, "Scenario prompt is required").max(10000),
  expected_behaviour: z.string().max(5000).optional(),
  min_score: z.coerce.number().min(0).max(100).default(80),
  is_published: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const runScenarioSchema = z.object({
  scenario_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  agent_response: z.string().max(50000).optional(),
  agent_webhook_url: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .pipe(z.string().url().optional()),
});

export type PassCriteria = {
  min_score?: number;
  compliance_required?: boolean;
};

export function parsePassCriteria(raw: Record<string, unknown>): PassCriteria {
  return {
    min_score: typeof raw.min_score === "number" ? raw.min_score : 80,
    compliance_required: raw.compliance_required === true,
  };
}
