"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { isAuthEnabled } from "@/lib/auth/config";
import { canWriteOrg } from "@/lib/auth/permissions";
import { writeAuditLog } from "@/lib/data/audit";
import { getIncidentById } from "@/lib/data/incidents";
import { insertTestScenario } from "@/lib/data/scenarios";

const logIncidentSchema = z.object({
  agent_id: z.string().uuid("Select an agent"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

const updateIncidentSchema = z.object({
  incident_id: z.string().uuid(),
  status: z.enum(["open", "investigating", "resolved", "closed"]).optional(),
  root_cause: z.string().optional(),
});

export type IncidentActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function logIncident(
  _prev: IncidentActionState,
  formData: FormData
): Promise<IncidentActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to log incidents." };
  }

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to log incidents." };
  }

  const parsed = logIncidentSchema.safeParse(Object.fromEntries(formData));
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

  const supabase = await createClient();
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from("incidents")
    .insert({
      organization_id: organizationId,
      agent_id: parsed.data.agent_id,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      severity: parsed.data.severity,
      status: "open",
      reported_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to log incident" };
  }

  await writeAuditLog({
    organizationId,
    entityType: "incident",
    entityId: data.id,
    action: "create",
    metadata: {
      title: parsed.data.title,
      severity: parsed.data.severity,
      agent_id: parsed.data.agent_id,
    },
  });

  revalidatePath("/dashboard/incidents");
  return { success: "Incident logged" };
}

export async function updateIncident(
  _prev: IncidentActionState,
  formData: FormData
): Promise<IncidentActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to update incidents." };
  }

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to update incidents." };
  }

  const parsed = updateIncidentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid update." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { error: "No workspace selected." };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.status) {
    updates.status = parsed.data.status;
    if (parsed.data.status === "resolved" || parsed.data.status === "closed") {
      updates.resolved_at = new Date().toISOString();
    }
  }

  if (parsed.data.root_cause !== undefined) {
    updates.root_cause = parsed.data.root_cause.trim() || null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("incidents")
    .update(updates)
    .eq("id", parsed.data.incident_id)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog({
    organizationId,
    entityType: "incident",
    entityId: parsed.data.incident_id,
    action: "update",
    metadata: updates,
  });

  revalidatePath("/dashboard/incidents");
  return { success: "Incident updated" };
}

export async function triggerIncidentReassessment(
  incidentId: string
): Promise<IncidentActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to trigger reassessment." };
  }

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to trigger reassessment." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { error: "No workspace selected." };
  }

  const incident = await getIncidentById(organizationId, incidentId);
  if (!incident) {
    return { error: "Incident not found." };
  }

  const existingScenarioId = Array.isArray(incident.remediation)
    ? (incident.remediation as { type?: string; scenario_id?: string }[]).find(
        (item) => item.type === "reassessment" && item.scenario_id
      )?.scenario_id
    : null;

  if (existingScenarioId) {
    return { error: "Reassessment scenario already created for this incident." };
  }

  const user = await getAuthUser();
  const prompt =
    incident.description?.trim() ||
    `Evaluate agent behaviour after incident: ${incident.title}`;

  const { scenario, error: scenarioError } = await insertTestScenario(
    organizationId,
    {
      name: `Reassessment: ${incident.title}`,
      prompt,
      expected_behaviour: "Agent should handle the incident scenario safely and within policy.",
      pass_criteria: { min_score: 80 },
      is_published: true,
    },
    user?.id ?? null
  );

  if (scenarioError || !scenario) {
    return { error: scenarioError ?? "Failed to create reassessment scenario" };
  }

  const supabase = await createClient();
  const remediationEntry = {
    type: "reassessment",
    scenario_id: scenario.id,
    triggered_at: new Date().toISOString(),
  };

  const currentRemediation = Array.isArray(incident.remediation) ? incident.remediation : [];

  const { error: updateError } = await supabase
    .from("incidents")
    .update({
      status: "investigating",
      remediation: [...currentRemediation, remediationEntry],
      updated_at: new Date().toISOString(),
    })
    .eq("id", incidentId)
    .eq("organization_id", organizationId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase
    .from("agents")
    .update({ certification_status: "in_progress" })
    .eq("organization_id", organizationId)
    .eq("id", incident.agent_id)
    .eq("certification_status", "certified");

  await writeAuditLog({
    organizationId,
    entityType: "incident",
    entityId: incidentId,
    action: "update",
    metadata: {
      reassessment_scenario_id: scenario.id,
      workflow: "incident_reassessment",
    },
  });

  revalidatePath("/dashboard/incidents");
  revalidatePath("/dashboard/scenarios");
  revalidatePath(`/dashboard/scenarios/${scenario.id}`);
  return { success: `Reassessment scenario created. Run it from Scenarios.` };
}

export async function triggerIncidentReassessmentFromForm(formData: FormData): Promise<void> {
  const incidentId = String(formData.get("incidentId") ?? "");
  await triggerIncidentReassessment(incidentId);
}
