import OpenAI from "openai";
import { z } from "zod";

const evaluationSchema = z.object({
  score: z.number().min(0).max(100),
  result: z.enum(["pass", "fail"]),
  metrics: z.object({
    accuracy: z.number(),
    compliance: z.number(),
    tone: z.number(),
    hallucination_risk: z.number(),
    latency_ms: z.number().optional(),
  }),
  summary: z.string(),
  recommendations: z.array(z.string()).optional(),
});

export type ScenarioEvaluation = z.infer<typeof evaluationSchema>;

export async function evaluateScenario(params: {
  scenarioName: string;
  scenarioPrompt: string;
  expectedBehaviour: string;
  passCriteria: { min_score?: number };
  agentResponse: string;
}): Promise<ScenarioEvaluation> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return mockEvaluation(params);
  }

  const openai = new OpenAI({ apiKey });
  const minScore = params.passCriteria.min_score ?? 80;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an enterprise AI agent evaluator for AgentScale. Score agent responses 0-100 on accuracy, compliance, tone, and hallucination risk. Pass threshold: ${minScore}. Return JSON: { score, result: "pass"|"fail", metrics: { accuracy, compliance, tone, hallucination_risk }, summary, recommendations[] }`,
      },
      {
        role: "user",
        content: `Scenario: ${params.scenarioName}\nPrompt: ${params.scenarioPrompt}\nExpected: ${params.expectedBehaviour}\n\nAgent response:\n${params.agentResponse}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = evaluationSchema.parse(JSON.parse(raw));
  return parsed;
}

function mockEvaluation(params: {
  passCriteria: { min_score?: number };
  agentResponse: string;
}): ScenarioEvaluation {
  const minScore = params.passCriteria.min_score ?? 80;
  const score = params.agentResponse.length > 50 ? 88 : 62;
  return {
    score,
    result: score >= minScore ? "pass" : "fail",
    metrics: {
      accuracy: score,
      compliance: score - 2,
      tone: 85,
      hallucination_risk: 8,
    },
    summary: "Demo evaluation (set OPENAI_API_KEY for live scoring).",
    recommendations: ["Review policy pack version", "Schedule reassessment in 30 days"],
  };
}
