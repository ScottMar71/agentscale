"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { isAuthEnabled } from "@/lib/auth/config";
import { canWriteOrg } from "@/lib/auth/permissions";
import { rollbackAgentVersion } from "@/lib/data/versions";
import { writeAuditLog } from "@/lib/data/audit";

export type VersionActionState = {
  error?: string;
  success?: string;
};

export async function rollbackToVersion(
  agentId: string,
  versionId: string
): Promise<VersionActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to rollback versions." };
  }

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to rollback versions." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { error: "No workspace selected." };
  }

  const { error } = await rollbackAgentVersion(organizationId, agentId, versionId);
  if (error) {
    return { error };
  }

  await writeAuditLog({
    organizationId,
    entityType: "agent",
    entityId: agentId,
    action: "rollback",
    metadata: { version_id: versionId },
  });

  revalidatePath("/dashboard/versions");
  revalidatePath(`/dashboard/agents/${agentId}`);
  return { success: "Agent rolled back to selected version" };
}

export async function rollbackToVersionFromForm(formData: FormData): Promise<void> {
  const agentId = String(formData.get("agentId") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  await rollbackToVersion(agentId, versionId);
}
