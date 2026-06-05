import { createClient } from "@/lib/supabase/server";
import { demoScenarios, demoScenarioRuns } from "@/lib/demo-data";
import { resolveDataContext } from "@/lib/data/context";
import { parsePassCriteria, type PassCriteria } from "@/lib/schemas/scenario";
import type { ScenarioRun, TestScenario } from "@/types";

type ScenarioRow = {
  id: string;
  organization_id: string;
  name: string;
  prompt: string;
  expected_behaviour: string | null;
  pass_criteria: Record<string, unknown>;
  is_published: boolean;
};

function mapScenario(row: ScenarioRow, runCount = 0): TestScenario {
  return {
    id: row.id,
    organization_id: row.organization_id,
    name: row.name,
    prompt: row.prompt,
    expected_behaviour: row.expected_behaviour,
    pass_criteria: row.pass_criteria ?? {},
    is_published: row.is_published ?? true,
    run_count: runCount,
  };
}

export async function listTestScenarios(): Promise<TestScenario[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoScenarios;
  }

  const supabase = await createClient();
  const { data: scenarios, error } = await supabase
    .from("test_scenarios")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error || !scenarios) {
    console.error("listTestScenarios:", error?.message);
    return demoScenarios;
  }

  const { data: runCounts } = await supabase
    .from("scenario_runs")
    .select("scenario_id")
    .eq("organization_id", organizationId);

  const counts = (runCounts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.scenario_id] = (acc[row.scenario_id] ?? 0) + 1;
    return acc;
  }, {});

  return scenarios.map((s) => mapScenario(s as ScenarioRow, counts[s.id] ?? 0));
}

export async function getTestScenario(id: string): Promise<TestScenario | null> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoScenarios.find((s) => s.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_scenarios")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const { count } = await supabase
    .from("scenario_runs")
    .select("*", { count: "exact", head: true })
    .eq("scenario_id", id);

  return mapScenario(data as ScenarioRow, count ?? 0);
}

export async function insertTestScenario(
  organizationId: string,
  payload: {
    name: string;
    prompt: string;
    expected_behaviour?: string | null;
    pass_criteria: PassCriteria;
    is_published: boolean;
  },
  createdBy: string | null
): Promise<{ scenario: TestScenario | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_scenarios")
    .insert({
      organization_id: organizationId,
      name: payload.name,
      prompt: payload.prompt,
      expected_behaviour: payload.expected_behaviour ?? null,
      pass_criteria: payload.pass_criteria,
      is_published: payload.is_published,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error || !data) {
    return { scenario: null, error: error?.message ?? "Failed to create scenario" };
  }

  return { scenario: mapScenario(data as ScenarioRow, 0) };
}

export async function updateTestScenario(
  organizationId: string,
  scenarioId: string,
  payload: {
    name: string;
    prompt: string;
    expected_behaviour?: string | null;
    pass_criteria: PassCriteria;
    is_published: boolean;
  }
): Promise<{ scenario: TestScenario | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_scenarios")
    .update({
      name: payload.name,
      prompt: payload.prompt,
      expected_behaviour: payload.expected_behaviour ?? null,
      pass_criteria: payload.pass_criteria,
      is_published: payload.is_published,
    })
    .eq("organization_id", organizationId)
    .eq("id", scenarioId)
    .select()
    .single();

  if (error || !data) {
    return { scenario: null, error: error?.message ?? "Failed to update scenario" };
  }

  return { scenario: mapScenario(data as ScenarioRow) };
}

export async function listScenarioRuns(limit = 25): Promise<ScenarioRun[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoScenarioRuns;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenario_runs")
    .select(
      `
      id,
      scenario_id,
      agent_id,
      score,
      result,
      metrics,
      evaluation_summary,
      created_at,
      agents!inner(name),
      test_scenarios!inner(name)
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const agents = row.agents as { name: string } | { name: string }[];
    const scenarios = row.test_scenarios as { name: string } | { name: string }[];
    const agentName = Array.isArray(agents) ? agents[0]?.name : agents?.name;
    const scenarioName = Array.isArray(scenarios) ? scenarios[0]?.name : scenarios?.name;
    return {
      id: row.id,
      scenario_id: row.scenario_id,
      scenario_name: scenarioName,
      agent_id: row.agent_id,
      agent_name: agentName,
      score: row.score,
      result: row.result as ScenarioRun["result"],
      metrics: (row.metrics as Record<string, number>) ?? {},
      evaluation_summary: row.evaluation_summary,
      created_at: row.created_at,
    };
  });
}

export async function listRunsForScenario(scenarioId: string): Promise<ScenarioRun[]> {
  const { mode, organizationId } = await resolveDataContext();

  if (mode === "demo" || !organizationId) {
    return demoScenarioRuns.filter((r) => r.scenario_id === scenarioId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenario_runs")
    .select(
      `
      id,
      scenario_id,
      agent_id,
      score,
      result,
      metrics,
      evaluation_summary,
      created_at,
      agents!inner(name)
    `
    )
    .eq("organization_id", organizationId)
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row) => {
    const agents = row.agents as { name: string } | { name: string }[];
    const agentName = Array.isArray(agents) ? agents[0]?.name : agents?.name;
    return {
      id: row.id,
      scenario_id: row.scenario_id,
      agent_id: row.agent_id,
      agent_name: agentName,
      score: row.score,
      result: row.result as ScenarioRun["result"],
      metrics: (row.metrics as Record<string, number>) ?? {},
      evaluation_summary: row.evaluation_summary,
      created_at: row.created_at,
    };
  });
}

export async function insertScenarioRun(
  organizationId: string,
  params: {
    scenario_id: string;
    agent_id: string;
    score: number;
    result: "pass" | "fail";
    metrics: Record<string, number>;
    evaluation_summary: string;
    run_by: string | null;
  }
): Promise<{ run: ScenarioRun | null; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenario_runs")
    .insert({
      organization_id: organizationId,
      scenario_id: params.scenario_id,
      agent_id: params.agent_id,
      score: params.score,
      result: params.result,
      metrics: params.metrics,
      evaluation_summary: params.evaluation_summary,
      run_by: params.run_by,
    })
    .select()
    .single();

  if (error || !data) {
    return { run: null, error: error?.message ?? "Failed to save run" };
  }

  return {
    run: {
      id: data.id,
      scenario_id: data.scenario_id,
      agent_id: data.agent_id,
      score: data.score,
      result: data.result as ScenarioRun["result"],
      metrics: (data.metrics as Record<string, number>) ?? {},
      evaluation_summary: data.evaluation_summary,
      created_at: data.created_at,
    },
  };
}

export async function countPassingRunsForAgent(
  organizationId: string,
  agentId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("scenario_runs")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("agent_id", agentId)
    .eq("result", "pass");

  if (error) return 0;
  return count ?? 0;
}

export function getPassCriteriaFromScenario(scenario: TestScenario): PassCriteria {
  return parsePassCriteria(scenario.pass_criteria as Record<string, unknown>);
}
