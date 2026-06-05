import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveDataContext } from "@/lib/data/context";
import type { PerformanceSnapshot } from "@/types";

const demoPerformance: PerformanceSnapshot[] = [
  {
    id: "p1",
    agent_id: "a1",
    agent_name: "Sales SDR Agent",
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    accuracy: 94,
    success_rate: 89,
    escalation_rate: 3,
    error_rate: 2,
    hallucination_rate: 5,
    cost_per_task: 0.042,
    avg_response_time_ms: 1100,
    health_score: 91,
  },
  {
    id: "p2",
    agent_id: "a2",
    agent_name: "Customer Support Agent",
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    accuracy: 92,
    success_rate: 87,
    escalation_rate: 6,
    error_rate: 4,
    hallucination_rate: 7,
    cost_per_task: 0.038,
    avg_response_time_ms: 980,
    health_score: 88,
  },
  {
    id: "p3",
    agent_id: "a3",
    agent_name: "Code Review Agent",
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    accuracy: 96,
    success_rate: 93,
    escalation_rate: 1,
    error_rate: 1,
    hallucination_rate: 3,
    cost_per_task: 0.055,
    avg_response_time_ms: 2200,
    health_score: 94,
  },
  {
    id: "p4",
    agent_id: "a4",
    agent_name: "Finance Ops Agent",
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    accuracy: 78,
    success_rate: 72,
    escalation_rate: 12,
    error_rate: 9,
    hallucination_rate: 18,
    cost_per_task: 0.061,
    avg_response_time_ms: 1850,
    health_score: 71,
  },
];

export type PerformanceSnapshotInput = {
  agent_id: string;
  period_start: string;
  period_end: string;
  accuracy?: number | null;
  success_rate?: number | null;
  escalation_rate?: number | null;
  error_rate?: number | null;
  hallucination_rate?: number | null;
  user_satisfaction?: number | null;
  cost_per_task?: number | null;
  avg_response_time_ms?: number | null;
  health_score?: number | null;
};

function mapRow(row: Record<string, unknown>, agentName: string): PerformanceSnapshot {
  return {
    id: row.id as string,
    agent_id: row.agent_id as string,
    agent_name: agentName,
    period_start: row.period_start as string,
    period_end: row.period_end as string,
    accuracy: row.accuracy != null ? Number(row.accuracy) : null,
    success_rate: row.success_rate != null ? Number(row.success_rate) : null,
    escalation_rate: row.escalation_rate != null ? Number(row.escalation_rate) : null,
    error_rate: row.error_rate != null ? Number(row.error_rate) : null,
    hallucination_rate: row.hallucination_rate != null ? Number(row.hallucination_rate) : null,
    cost_per_task: row.cost_per_task != null ? Number(row.cost_per_task) : null,
    avg_response_time_ms:
      row.avg_response_time_ms != null ? Number(row.avg_response_time_ms) : null,
    health_score: row.health_score != null ? Number(row.health_score) : null,
  };
}

export async function listLatestPerformanceSnapshots(): Promise<{
  snapshots: PerformanceSnapshot[];
  isDemo: boolean;
}> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return { snapshots: demoPerformance, isDemo: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("performance_snapshots")
    .select(
      `
      id,
      agent_id,
      period_start,
      period_end,
      accuracy,
      success_rate,
      escalation_rate,
      error_rate,
      hallucination_rate,
      cost_per_task,
      avg_response_time_ms,
      health_score,
      created_at,
      agents (name)
    `
    )
    .eq("organization_id", organizationId)
    .order("period_end", { ascending: false });

  if (error || !data) {
    return { snapshots: [], isDemo: false };
  }

  const latestByAgent = new Map<string, PerformanceSnapshot>();
  for (const row of data) {
    const agentId = row.agent_id as string;
    if (latestByAgent.has(agentId)) continue;
    const agent = row.agents as { name: string } | { name: string }[] | null;
    const agentName = Array.isArray(agent) ? agent[0]?.name : agent?.name;
    latestByAgent.set(agentId, mapRow(row as Record<string, unknown>, agentName ?? "Unknown"));
  }

  return {
    snapshots: [...latestByAgent.values()].sort((a, b) =>
      (b.health_score ?? 0) - (a.health_score ?? 0)
    ),
    isDemo: false,
  };
}

export async function insertPerformanceSnapshot(
  organizationId: string,
  input: PerformanceSnapshotInput
): Promise<{ snapshot: PerformanceSnapshot | null; error?: string }> {
  const supabase = await createClient();
  return insertPerformanceSnapshotWithClient(supabase, organizationId, input);
}

export async function insertPerformanceSnapshotWithClient(
  supabase: SupabaseClient,
  organizationId: string,
  input: PerformanceSnapshotInput
): Promise<{ snapshot: PerformanceSnapshot | null; error?: string }> {
  const { data, error } = await supabase
    .from("performance_snapshots")
    .insert({
      organization_id: organizationId,
      agent_id: input.agent_id,
      period_start: input.period_start,
      period_end: input.period_end,
      accuracy: input.accuracy ?? null,
      success_rate: input.success_rate ?? null,
      escalation_rate: input.escalation_rate ?? null,
      error_rate: input.error_rate ?? null,
      hallucination_rate: input.hallucination_rate ?? null,
      user_satisfaction: input.user_satisfaction ?? null,
      cost_per_task: input.cost_per_task ?? null,
      avg_response_time_ms: input.avg_response_time_ms ?? null,
      health_score: input.health_score ?? null,
    })
    .select(
      `
      id,
      agent_id,
      period_start,
      period_end,
      accuracy,
      success_rate,
      escalation_rate,
      error_rate,
      hallucination_rate,
      cost_per_task,
      avg_response_time_ms,
      health_score,
      agents (name)
    `
    )
    .single();

  if (error || !data) {
    return { snapshot: null, error: error?.message ?? "Failed to save snapshot" };
  }

  const agent = data.agents as { name: string } | { name: string }[] | null;
  const agentName = Array.isArray(agent) ? agent[0]?.name : agent?.name;

  if (input.health_score != null) {
    await supabase
      .from("agents")
      .update({ health_score: input.health_score })
      .eq("organization_id", organizationId)
      .eq("id", input.agent_id);
  }

  return {
    snapshot: mapRow(data as Record<string, unknown>, agentName ?? "Unknown"),
  };
}

export function computePerformanceSummary(snapshots: PerformanceSnapshot[]) {
  if (snapshots.length === 0) {
    return {
      avgAccuracy: null,
      avgSuccessRate: null,
      avgCostPerTask: null,
      avgResponseMs: null,
    };
  }

  const avg = (values: (number | null)[]) => {
    const nums = values.filter((v): v is number => v != null);
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  return {
    avgAccuracy: avg(snapshots.map((s) => s.accuracy)),
    avgSuccessRate: avg(snapshots.map((s) => s.success_rate)),
    avgCostPerTask: avg(snapshots.map((s) => s.cost_per_task)),
    avgResponseMs: avg(snapshots.map((s) => s.avg_response_time_ms)),
  };
}
