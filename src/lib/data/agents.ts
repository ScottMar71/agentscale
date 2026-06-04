import { createClient } from "@/lib/supabase/server";
import { demoAgents } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import { ensureAgentOnboarding } from "@/lib/data/onboarding";
import type { Agent, AgentStatus, RiskLevel, DeploymentStatus } from "@/types";

export interface AgentListFilters {
  search?: string;
  status?: string;
  department?: string;
}

type AgentRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  department: string | null;
  business_function: string | null;
  owner_id: string | null;
  status: AgentStatus;
  model_provider: string | null;
  model_version: string | null;
  prompt_version: string | null;
  tool_stack: string[] | unknown;
  knowledge_base_connected: boolean;
  risk_level: RiskLevel;
  certification_status: Agent["certification_status"];
  deployment_status: DeploymentStatus;
  health_score: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  owner?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
};

function mapAgentRow(row: AgentRow): Agent {
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
  const toolStack = Array.isArray(row.tool_stack)
    ? row.tool_stack.map(String)
    : [];

  return {
    id: row.id,
    organization_id: row.organization_id,
    name: row.name,
    description: row.description,
    department: row.department,
    business_function: row.business_function,
    owner_id: row.owner_id,
    owner_name: owner?.full_name ?? owner?.email ?? undefined,
    status: row.status,
    model_provider: row.model_provider,
    model_version: row.model_version,
    prompt_version: row.prompt_version,
    tool_stack: toolStack,
    knowledge_base_connected: row.knowledge_base_connected ?? false,
    risk_level: row.risk_level,
    certification_status: row.certification_status,
    deployment_status: row.deployment_status,
    health_score: row.health_score ?? 0,
    tags: row.tags ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function applyClientFilters(agents: Agent[], filters?: AgentListFilters): Agent[] {
  if (!filters) return agents;

  return agents.filter((a) => {
    const q = filters.search?.trim().toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      (a.description?.toLowerCase().includes(q) ?? false) ||
      a.tags.some((t) => t.includes(q));
    const matchStatus =
      !filters.status || filters.status === "all" || a.status === filters.status;
    const matchDept =
      !filters.department ||
      filters.department === "all" ||
      a.department === filters.department;
    return matchSearch && matchStatus && matchDept;
  });
}

export async function listAgents(filters?: AgentListFilters): Promise<Agent[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return applyClientFilters(demoAgents, filters);
  }

  const supabase = await createClient();
  let query = supabase
    .from("agents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.department && filters.department !== "all") {
    query = query.eq("department", filters.department);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("listAgents:", error?.message);
    return applyClientFilters(demoAgents, filters);
  }

  const mapped = data.map((row) => mapAgentRow(row as AgentRow));
  return applyClientFilters(mapped, filters);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoAgents.find((a) => a.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return demoAgents.find((a) => a.id === id) ?? null;
  }

  return mapAgentRow(data as AgentRow);
}

export async function listAgentDepartments(): Promise<string[]> {
  const agents = await listAgents();
  return [
    ...new Set(agents.map((a) => a.department).filter((d): d is string => Boolean(d))),
  ].sort();
}

export type AgentUpsertPayload = {
  name: string;
  description?: string | null;
  department?: string | null;
  business_function?: string | null;
  status: AgentStatus;
  risk_level: RiskLevel;
  deployment_status: DeploymentStatus;
  model_provider?: string | null;
  model_version?: string | null;
  prompt_version?: string | null;
  tags: string[];
  tool_stack: string[];
  knowledge_base_connected: boolean;
};

export async function insertAgent(
  organizationId: string,
  payload: AgentUpsertPayload,
  ownerId: string | null
): Promise<{ agent: Agent | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      organization_id: organizationId,
      owner_id: ownerId,
      name: payload.name,
      description: payload.description ?? null,
      department: payload.department ?? null,
      business_function: payload.business_function ?? null,
      status: payload.status,
      risk_level: payload.risk_level,
      deployment_status: payload.deployment_status,
      model_provider: payload.model_provider ?? null,
      model_version: payload.model_version ?? null,
      prompt_version: payload.prompt_version ?? "1.0.0",
      tags: payload.tags,
      tool_stack: payload.tool_stack,
      knowledge_base_connected: payload.knowledge_base_connected,
      certification_status: "none",
      health_score: 0,
    })
    .select()
    .single();

  if (error || !data) {
    return { agent: null, error: error?.message ?? "Failed to create agent" };
  }

  if (payload.status === "draft" || payload.status === "onboarding") {
    await ensureAgentOnboarding(organizationId, data.id as string);
  }

  return { agent: mapAgentRow(data as AgentRow) };
}

export async function updateAgentRecord(
  organizationId: string,
  agentId: string,
  payload: AgentUpsertPayload
): Promise<{ agent: Agent | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .update({
      name: payload.name,
      description: payload.description ?? null,
      department: payload.department ?? null,
      business_function: payload.business_function ?? null,
      status: payload.status,
      risk_level: payload.risk_level,
      deployment_status: payload.deployment_status,
      model_provider: payload.model_provider ?? null,
      model_version: payload.model_version ?? null,
      prompt_version: payload.prompt_version ?? null,
      tags: payload.tags,
      tool_stack: payload.tool_stack,
      knowledge_base_connected: payload.knowledge_base_connected,
    })
    .eq("organization_id", organizationId)
    .eq("id", agentId)
    .select()
    .single();

  if (error || !data) {
    return { agent: null, error: error?.message ?? "Failed to update agent" };
  }

  return { agent: mapAgentRow(data as AgentRow) };
}
