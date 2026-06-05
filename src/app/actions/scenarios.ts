"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/data/audit";
import { applyScenarioPassGate } from "@/lib/data/scenario-cert-gate";
import {
  getTestScenario,
  insertScenarioRun,
  insertTestScenario,
  updateTestScenario,
  getPassCriteriaFromScenario,
} from "@/lib/data/scenarios";
import { evaluateScenario, type ScenarioEvaluation } from "@/lib/openai/evaluate-scenario";
import { scenarioFormSchema, runScenarioSchema } from "@/lib/schemas/scenario";

export type ScenarioFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type RunScenarioState = {
  error?: string;
  evaluation?: ScenarioEvaluation;
  runId?: string;
};

async function fetchWebhookResponse(url: string, prompt: string): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, scenario_prompt: prompt }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Webhook returned ${res.status}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const text =
    (typeof data.response === "string" && data.response) ||
    (typeof data.message === "string" && data.message) ||
    (typeof data.output === "string" && data.output) ||
    (typeof data.text === "string" && data.text);

  if (!text) {
    throw new Error("Webhook JSON must include response, message, output, or text");
  }

  return text;
}

export async function createTestScenario(
  _prev: ScenarioFormState,
  formData: FormData
): Promise<ScenarioFormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to create scenarios." };
  }

  const parsed = scenarioFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { scenario, error } = await insertTestScenario(
    organizationId,
    {
      name: parsed.data.name,
      prompt: parsed.data.prompt,
      expected_behaviour: parsed.data.expected_behaviour?.trim() || null,
      pass_criteria: { min_score: parsed.data.min_score },
      is_published: parsed.data.is_published ?? true,
    },
    user?.id ?? null
  );

  if (error || !scenario) return { error: error ?? "Failed to create scenario" };

  await writeAuditLog({
    organizationId,
    entityType: "test_scenario",
    entityId: scenario.id,
    action: "create",
    metadata: { name: scenario.name },
  });

  revalidatePath("/dashboard/scenarios");
  redirect(`/dashboard/scenarios/${scenario.id}`);
}

export async function updateTestScenarioAction(
  scenarioId: string,
  _prev: ScenarioFormState,
  formData: FormData
): Promise<ScenarioFormState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to update scenarios." };
  }

  const parsed = scenarioFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const { scenario, error } = await updateTestScenario(organizationId, scenarioId, {
    name: parsed.data.name,
    prompt: parsed.data.prompt,
    expected_behaviour: parsed.data.expected_behaviour?.trim() || null,
    pass_criteria: { min_score: parsed.data.min_score },
    is_published: parsed.data.is_published ?? true,
  });

  if (error || !scenario) return { error: error ?? "Failed to update scenario" };

  await writeAuditLog({
    organizationId,
    entityType: "test_scenario",
    entityId: scenarioId,
    action: "update",
    metadata: { name: scenario.name },
  });

  revalidatePath("/dashboard/scenarios");
  revalidatePath(`/dashboard/scenarios/${scenarioId}`);
  return {};
}

export async function runTestScenario(
  _prev: RunScenarioState,
  formData: FormData
): Promise<RunScenarioState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to run and store evaluations." };
  }

  const parsed = runScenarioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Select an agent and provide a response or webhook URL." };
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No workspace selected." };

  const scenario = await getTestScenario(parsed.data.scenario_id);
  if (!scenario) return { error: "Scenario not found." };

  let agentResponse = parsed.data.agent_response?.trim() ?? "";
  const webhook = parsed.data.agent_webhook_url?.trim();

  if (!agentResponse && webhook) {
    try {
      agentResponse = await fetchWebhookResponse(webhook, scenario.prompt);
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Webhook request failed",
      };
    }
  }

  if (!agentResponse) {
    return { error: "Paste an agent response or provide a webhook URL." };
  }

  const passCriteria = getPassCriteriaFromScenario(scenario);
  const evaluation = await evaluateScenario({
    scenarioName: scenario.name,
    scenarioPrompt: scenario.prompt,
    expectedBehaviour: scenario.expected_behaviour ?? "",
    passCriteria,
    agentResponse,
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { run, error } = await insertScenarioRun(organizationId, {
    scenario_id: parsed.data.scenario_id,
    agent_id: parsed.data.agent_id,
    score: evaluation.score,
    result: evaluation.result,
    metrics: evaluation.metrics,
    evaluation_summary: evaluation.summary,
    run_by: user?.id ?? null,
  });

  if (error || !run) {
    return { error: error ?? "Failed to save evaluation run" };
  }

  await applyScenarioPassGate(
    organizationId,
    parsed.data.agent_id,
    evaluation.result === "pass"
  );

  await writeAuditLog({
    organizationId,
    entityType: "scenario_run",
    entityId: run.id,
    action: "create",
    metadata: {
      scenario_id: parsed.data.scenario_id,
      agent_id: parsed.data.agent_id,
      score: evaluation.score,
      result: evaluation.result,
    },
  });

  revalidatePath("/dashboard/scenarios");
  revalidatePath(`/dashboard/scenarios/${parsed.data.scenario_id}`);
  revalidatePath(`/dashboard/agents/${parsed.data.agent_id}`);
  revalidatePath("/dashboard/onboarding");

  return {
    evaluation,
    runId: run.id,
  };
}
