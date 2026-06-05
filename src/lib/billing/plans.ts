import { PLANS } from "@/lib/constants";

export type SubscriptionPlan = keyof typeof PLANS;

/** DB `agent_limit` value for a plan (enterprise = high cap). */
export function agentLimitForPlan(plan: SubscriptionPlan): number {
  const agents = PLANS[plan].agents;
  return agents < 0 ? 10_000 : agents;
}

export function isWithinAgentLimit(currentCount: number, limit: number): boolean {
  if (limit >= 10_000) return true;
  return currentCount < limit;
}

export function formatAgentLimit(limit: number): string {
  return limit >= 10_000 ? "Unlimited" : String(limit);
}
