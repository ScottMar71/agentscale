import { toggleOnboardingItem } from "@/lib/data/onboarding";
import { countPassingRunsForAgent } from "@/lib/data/scenarios";

/** Mark onboarding "test_scenarios" once the agent has at least one passing run. */
export async function applyScenarioPassGate(
  organizationId: string,
  agentId: string,
  scenarioPassed: boolean
): Promise<void> {
  if (!scenarioPassed) return;

  const passCount = await countPassingRunsForAgent(organizationId, agentId);
  if (passCount < 1) return;

  await toggleOnboardingItem(organizationId, agentId, "test_scenarios", true);
}
