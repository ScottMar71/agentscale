import { createClient } from "@/lib/supabase/server";
import { demoIncidents } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import type { Incident } from "@/types";

function parseReassessmentScenarioId(remediation: unknown): string | null {
  if (!Array.isArray(remediation)) return null;
  for (const item of remediation) {
    if (
      item &&
      typeof item === "object" &&
      (item as { type?: string }).type === "reassessment" &&
      typeof (item as { scenario_id?: string }).scenario_id === "string"
    ) {
      return (item as { scenario_id: string }).scenario_id;
    }
  }
  return null;
}

export async function listIncidents(): Promise<{ incidents: Incident[]; isDemo: boolean }> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return { incidents: demoIncidents, isDemo: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(
      `
      id,
      agent_id,
      title,
      description,
      severity,
      status,
      root_cause,
      remediation,
      created_at,
      agents (
        name
      )
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { incidents: [], isDemo: false };
  }

  return {
    isDemo: false,
    incidents: data.map((row) => {
      const agent = row.agents as { name: string } | { name: string }[] | null;
      const agentName = Array.isArray(agent) ? agent[0]?.name : agent?.name;
      return {
        id: row.id,
        agent_id: row.agent_id,
        agent_name: agentName ?? "Unknown agent",
        title: row.title,
        description: row.description,
        severity: row.severity as Incident["severity"],
        status: row.status,
        root_cause: row.root_cause,
        reassessment_scenario_id: parseReassessmentScenarioId(row.remediation),
        created_at: row.created_at,
      };
    }),
  };
}

export async function listAgentsForIncidentForm(): Promise<{ id: string; name: string }[]> {
  const { mode, organizationId } = await resolveDataContext();
  if (mode === "demo" || !organizationId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");

  if (error || !data) return [];
  return data;
}

export async function getIncidentById(
  organizationId: string,
  incidentId: string
): Promise<{
  id: string;
  agent_id: string;
  title: string;
  description: string | null;
  remediation: unknown;
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("id, agent_id, title, description, remediation")
    .eq("organization_id", organizationId)
    .eq("id", incidentId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
