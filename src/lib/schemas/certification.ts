import { z } from "zod";

export const requestCertificationSchema = z.object({
  agent_id: z.string().uuid("Select an agent"),
  certification_id: z.string().uuid("Select a certification"),
});

export const reviewCertificationSchema = z.object({
  agent_certification_id: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
});

export type CertificationRules = {
  min_scenario_passes?: number;
  require_onboarding_complete?: boolean;
  min_training_percent?: number;
};

export function parseCertificationRules(raw: Record<string, unknown>): CertificationRules {
  return {
    min_scenario_passes:
      typeof raw.min_scenario_passes === "number" ? raw.min_scenario_passes : 1,
    require_onboarding_complete: raw.require_onboarding_complete === true,
    min_training_percent:
      typeof raw.min_training_percent === "number" ? raw.min_training_percent : undefined,
  };
}
