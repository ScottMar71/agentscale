import { createClient } from "@/lib/supabase/server";
import { demoAgents, demoOnboarding } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import {
  buildDefaultChecklist,
  computeProgressPercent,
  type ChecklistItem,
} from "@/lib/onboarding/checklist";
import type { OnboardingRecord } from "@/types";

type OnboardingRow = {
  id: string;
  agent_id: string;
  organization_id: string;
  checklist: ChecklistItem[];
  progress_percent: number;
  completed_at: string | null;
};

function mapOnboardingRow(
  row: OnboardingRow,
  agentName: string
): OnboardingRecord {
  const checklist = buildDefaultChecklist(row.checklist);
  return {
    id: row.id,
    agent_id: row.agent_id,
    agent_name: agentName,
    progress_percent: row.progress_percent,
    checklist,
    completed_at: row.completed_at,
  };
}

export async function listOnboardingRecords(): Promise<OnboardingRecord[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoOnboarding;
  }

  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, status")
    .eq("organization_id", organizationId)
    .in("status", ["draft", "onboarding"]);

  if (!agents?.length) return [];

  const { data: rows, error } = await supabase
    .from("agent_onboarding")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    console.error("listOnboardingRecords:", error.message);
    return [];
  }

  const byAgent = new Map((rows ?? []).map((r) => [r.agent_id, r as OnboardingRow]));

  const records: OnboardingRecord[] = [];

  for (const agent of agents) {
    let row = byAgent.get(agent.id);
    if (!row) {
      const created = await ensureAgentOnboarding(organizationId, agent.id);
      if (created) row = created;
    }
    if (row) {
      records.push(mapOnboardingRow(row, agent.name));
    }
  }

  return records.sort((a, b) => b.progress_percent - a.progress_percent);
}

export async function ensureAgentOnboarding(
  organizationId: string,
  agentId: string
): Promise<OnboardingRow | null> {
  const supabase = await createClient();
  const checklist = buildDefaultChecklist();

  const { data: existing } = await supabase
    .from("agent_onboarding")
    .select("*")
    .eq("agent_id", agentId)
    .maybeSingle();

  if (existing) return existing as OnboardingRow;

  const { data, error } = await supabase
    .from("agent_onboarding")
    .insert({
      agent_id: agentId,
      organization_id: organizationId,
      checklist,
      progress_percent: 0,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("ensureAgentOnboarding:", error?.message);
    return null;
  }

  return data as OnboardingRow;
}

export async function toggleOnboardingItem(
  organizationId: string,
  agentId: string,
  itemKey: string,
  completed: boolean
): Promise<{ record: OnboardingRecord | null; error?: string }> {
  const supabase = await createClient();

  const row = await ensureAgentOnboarding(organizationId, agentId);
  if (!row) return { record: null, error: "Onboarding record not found" };

  const checklist = buildDefaultChecklist(row.checklist).map((item) =>
    item.key === itemKey ? { ...item, completed } : item
  );
  const progress_percent = computeProgressPercent(checklist);
  const completed_at =
    progress_percent === 100 ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("agent_onboarding")
    .update({
      checklist,
      progress_percent,
      completed_at,
    })
    .eq("organization_id", organizationId)
    .eq("agent_id", agentId)
    .select()
    .single();

  if (error || !data) {
    return { record: null, error: error?.message ?? "Update failed" };
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("name")
    .eq("id", agentId)
    .maybeSingle();

  return {
    record: mapOnboardingRow(data as OnboardingRow, agent?.name ?? "Agent"),
  };
}

export async function getOnboardingForAgent(
  agentId: string
): Promise<OnboardingRecord | null> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoOnboarding.find((r) => r.agent_id === agentId) ?? null;
  }

  const agent = demoAgents.find((a) => a.id === agentId);
  const supabase = await createClient();
  const { data: agentRow } = await supabase
    .from("agents")
    .select("name")
    .eq("id", agentId)
    .maybeSingle();

  const name = agentRow?.name ?? agent?.name ?? "Agent";
  const row = await ensureAgentOnboarding(organizationId, agentId);
  if (!row) return null;
  return mapOnboardingRow(row, name);
}
