import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateScenario } from "@/lib/openai/evaluate-scenario";

const schema = z.object({
  scenarioName: z.string(),
  scenarioPrompt: z.string(),
  expectedBehaviour: z.string(),
  passCriteria: z.object({ min_score: z.number().optional() }).default({}),
  agentResponse: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const evaluation = await evaluateScenario(body);
    return NextResponse.json(evaluation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
