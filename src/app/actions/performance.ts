"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { isAuthEnabled } from "@/lib/auth/config";
import { canWriteOrg } from "@/lib/auth/permissions";
import {
  insertPerformanceSnapshot,
  type PerformanceSnapshotInput,
} from "@/lib/data/performance";
import { writeAuditLog } from "@/lib/data/audit";

const snapshotSchema = z.object({
  agent_id: z.string().uuid("Select an agent"),
  period_start: z.string().min(1, "Start date required"),
  period_end: z.string().min(1, "End date required"),
  accuracy: z.coerce.number().min(0).max(100).optional(),
  success_rate: z.coerce.number().min(0).max(100).optional(),
  escalation_rate: z.coerce.number().min(0).max(100).optional(),
  error_rate: z.coerce.number().min(0).max(100).optional(),
  hallucination_rate: z.coerce.number().min(0).max(100).optional(),
  cost_per_task: z.coerce.number().min(0).optional(),
  avg_response_time_ms: z.coerce.number().int().min(0).optional(),
  health_score: z.coerce.number().int().min(0).max(100).optional(),
});

export type PerformanceActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function emptyToUndefined(value: FormDataEntryValue | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function importPerformanceSnapshot(
  _prev: PerformanceActionState,
  formData: FormData
): Promise<PerformanceActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to import performance data." };
  }

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to import performance data." };
  }

  const parsed = snapshotSchema.safeParse({
    agent_id: formData.get("agent_id"),
    period_start: formData.get("period_start"),
    period_end: formData.get("period_end"),
    accuracy: emptyToUndefined(formData.get("accuracy")),
    success_rate: emptyToUndefined(formData.get("success_rate")),
    escalation_rate: emptyToUndefined(formData.get("escalation_rate")),
    error_rate: emptyToUndefined(formData.get("error_rate")),
    hallucination_rate: emptyToUndefined(formData.get("hallucination_rate")),
    cost_per_task: emptyToUndefined(formData.get("cost_per_task")),
    avg_response_time_ms: emptyToUndefined(formData.get("avg_response_time_ms")),
    health_score: emptyToUndefined(formData.get("health_score")),
  });

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { error: "No workspace selected." };
  }

  const input: PerformanceSnapshotInput = parsed.data;
  const { snapshot, error } = await insertPerformanceSnapshot(organizationId, input);

  if (error || !snapshot) {
    return { error: error ?? "Failed to import snapshot" };
  }

  await writeAuditLog({
    organizationId,
    entityType: "performance_snapshot",
    entityId: snapshot.id,
    action: "create",
    metadata: {
      agent_id: input.agent_id,
      period_start: input.period_start,
      period_end: input.period_end,
    },
  });

  revalidatePath("/dashboard/performance");
  return { success: "Performance snapshot imported" };
}
