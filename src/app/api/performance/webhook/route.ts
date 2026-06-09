import { NextResponse } from "next/server";
import { z } from "zod";
import {
  insertPerformanceSnapshotWithClient,
  type PerformanceSnapshotInput,
} from "@/lib/data/performance";
import { getServiceSupabase } from "@/lib/supabase/service";

const webhookSchema = z.object({
  organization_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  accuracy: z.number().min(0).max(100).optional(),
  success_rate: z.number().min(0).max(100).optional(),
  escalation_rate: z.number().min(0).max(100).optional(),
  error_rate: z.number().min(0).max(100).optional(),
  hallucination_rate: z.number().min(0).max(100).optional(),
  user_satisfaction: z.number().min(0).max(100).optional(),
  cost_per_task: z.number().min(0).optional(),
  avg_response_time_ms: z.number().int().min(0).optional(),
  health_score: z.number().int().min(0).max(100).optional(),
});

function authorize(request: Request): boolean {
  const secret = process.env.PERFORMANCE_WEBHOOK_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role not configured" }, { status: 503 });
  }

  try {
    const body = webhookSchema.parse(await request.json());

    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("organization_id", body.organization_id)
      .eq("id", body.agent_id)
      .maybeSingle();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found in organization" }, { status: 404 });
    }

    const input: PerformanceSnapshotInput = body;
    const { snapshot, error } = await insertPerformanceSnapshotWithClient(
      supabase,
      body.organization_id,
      input
    );

    if (error || !snapshot) {
      return NextResponse.json({ error: error ?? "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, snapshot_id: snapshot.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to ingest snapshot" }, { status: 500 });
  }
}
