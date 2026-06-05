"use server";

import { revalidatePath } from "next/cache";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";
import { toggleOnboardingItem } from "@/lib/data/onboarding";
import { writeAuditLog } from "@/lib/data/audit";

export type OnboardingActionState = {
  error?: string;
};

export async function updateOnboardingChecklistItem(
  agentId: string,
  itemKey: string,
  completed: boolean
): Promise<OnboardingActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to update onboarding progress." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to update onboarding." };
  }

  const { record, error } = await toggleOnboardingItem(
    organizationId,
    agentId,
    itemKey,
    completed
  );

  if (error || !record) {
    return { error: error ?? "Update failed" };
  }

  await writeAuditLog({
    organizationId,
    entityType: "agent_onboarding",
    entityId: agentId,
    action: "update",
    metadata: {
      item: itemKey,
      completed,
      progress_percent: record.progress_percent,
    },
  });

  revalidatePath("/dashboard/onboarding");
  revalidatePath(`/dashboard/agents/${agentId}`);
  return {};
}
