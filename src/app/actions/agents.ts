"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization, getCurrentOrganizationId } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";
import {
  insertAgent,
  updateAgentRecord,
  type AgentUpsertPayload,
} from "@/lib/data/agents";
import { writeAuditLog } from "@/lib/data/audit";
import {
  agentFormSchema,
  parseTagsInput,
  parseToolStackInput,
} from "@/lib/schemas/agent";

export type AgentFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function toPayload(
  data: ReturnType<typeof agentFormSchema.parse>
): AgentUpsertPayload {
  return {
    name: data.name,
    description: data.description?.trim() || null,
    department: data.department?.trim() || null,
    business_function: data.business_function?.trim() || null,
    status: data.status,
    risk_level: data.risk_level,
    deployment_status: data.deployment_status,
    model_provider: data.model_provider?.trim() || null,
    model_version: data.model_version?.trim() || null,
    prompt_version: data.prompt_version?.trim() || "1.0.0",
    tags: parseTagsInput(data.tags),
    tool_stack: parseToolStackInput(data.tool_stack),
    knowledge_base_connected: data.knowledge_base_connected ?? false,
  };
}

export async function createAgent(
  _prev: AgentFormState,
  formData: FormData
): Promise<AgentFormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to register agents in your workspace." };
  }

  const parsed = agentFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { error: "No workspace selected. Complete setup first." };
  }

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to register agents." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = toPayload(parsed.data);
  const { agent, error } = await insertAgent(organizationId, payload, user?.id ?? null);

  if (error || !agent) {
    return { error: error ?? "Failed to create agent" };
  }

  await writeAuditLog({
    organizationId,
    entityType: "agent",
    entityId: agent.id,
    action: "create",
    metadata: { name: agent.name, status: agent.status },
  });

  revalidatePath("/dashboard/agents");
  redirect(`/dashboard/agents/${agent.id}`);
}

export async function updateAgent(
  agentId: string,
  _prev: AgentFormState,
  formData: FormData
): Promise<AgentFormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to edit agents in your workspace." };
  }

  const parsed = agentFormSchema.safeParse(Object.fromEntries(formData));
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

  const org = await getCurrentOrganization();
  if (!org || !canWriteOrg(org.role)) {
    return { error: "You do not have permission to edit agents." };
  }

  const payload = toPayload(parsed.data);
  const { agent, error } = await updateAgentRecord(organizationId, agentId, payload);

  if (error || !agent) {
    return { error: error ?? "Failed to update agent" };
  }

  await writeAuditLog({
    organizationId,
    entityType: "agent",
    entityId: agent.id,
    action: "update",
    metadata: { name: agent.name, status: agent.status },
  });

  revalidatePath("/dashboard/agents");
  revalidatePath(`/dashboard/agents/${agentId}`);
  redirect(`/dashboard/agents/${agentId}`);
}
