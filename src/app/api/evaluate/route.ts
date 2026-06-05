import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateScenario } from "@/lib/openai/evaluate-scenario";
import { createClient } from "@/lib/supabase/server";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import {
  getTestScenario,
  insertScenarioRun,
  getPassCriteriaFromScenario,
} from "@/lib/data/scenarios";
import { applyScenarioPassGate } from "@/lib/data/scenario-cert-gate";

const schema = z.object({
  scenarioName: z.string().optional(),
  scenarioPrompt: z.string().optional(),
  expectedBehaviour: z.string().optional(),
  passCriteria: z.object({ min_score: z.number().optional() }).optional(),
  agentResponse: z.string().min(1),
  scenario_id: z.string().uuid().optional(),
  agent_id: z.string().uuid().optional(),
  persist: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    let scenarioName = body.scenarioName ?? "Scenario";
    let scenarioPrompt = body.scenarioPrompt ?? "";
    let expectedBehaviour = body.expectedBehaviour ?? "";
    let passCriteria = body.passCriteria ?? { min_score: 80 };

    if (body.scenario_id && isAuthEnabled()) {
      const scenario = await getTestScenario(body.scenario_id);
      if (scenario) {
        scenarioName = scenario.name;
        scenarioPrompt = scenario.prompt;
        expectedBehaviour = scenario.expected_behaviour ?? "";
        passCriteria = getPassCriteriaFromScenario(scenario);
      }
    }

    const evaluation = await evaluateScenario({
      scenarioName,
      scenarioPrompt,
      expectedBehaviour,
      passCriteria,
      agentResponse: body.agentResponse,
    });

    if (
      body.persist &&
      body.scenario_id &&
      body.agent_id &&
      isAuthEnabled()
    ) {
      const organizationId = await getCurrentOrganizationId();
      if (organizationId) {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { run } = await insertScenarioRun(organizationId, {
          scenario_id: body.scenario_id,
          agent_id: body.agent_id,
          score: evaluation.score,
          result: evaluation.result,
          metrics: evaluation.metrics,
          evaluation_summary: evaluation.summary,
          run_by: user?.id ?? null,
        });

        if (run) {
          await applyScenarioPassGate(
            organizationId,
            body.agent_id,
            evaluation.result === "pass"
          );
        }
      }
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
