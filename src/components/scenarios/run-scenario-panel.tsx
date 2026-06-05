"use client";

import { useActionState } from "react";
import { runTestScenario, type RunScenarioState } from "@/app/actions/scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Agent, TestScenario } from "@/types";

const initial: RunScenarioState = {};
const textareaClass =
  "flex min-h-[140px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function RunScenarioPanel({
  scenario,
  agents,
}: {
  scenario: TestScenario;
  agents: Agent[];
}) {
  const runAction = runTestScenario;
  const [state, formAction, pending] = useActionState(runAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Run evaluation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="scenario_id" value={scenario.id} />

          <div className="space-y-1.5">
            <Label htmlFor="agent_id">Agent under test</Label>
            <select
              id="agent_id"
              name="agent_id"
              required
              className={selectClass}
              defaultValue=""
            >
              <option value="" disabled>
                Select agent
              </option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agent_response">Agent response (paste)</Label>
            <textarea
              id="agent_response"
              name="agent_response"
              className={textareaClass}
              placeholder="Paste the agent's reply to this scenario"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agent_webhook_url">Or webhook URL (optional)</Label>
            <Input
              id="agent_webhook_url"
              name="agent_webhook_url"
              type="url"
              placeholder="https://your-agent.example/run"
            />
            <p className="text-xs text-muted-foreground">
              POST with JSON {"{ prompt }"} — response must include response, message,
              output, or text.
            </p>
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending || agents.length === 0}>
            {pending ? "Evaluating…" : "Run scenario"}
          </Button>
        </form>

        {state.evaluation && (
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-heading text-3xl font-semibold">
                {state.evaluation.score}
              </span>
              <Badge
                className={cn(
                  "capitalize",
                  state.evaluation.result === "pass"
                    ? "bg-success-subtle text-success"
                    : "bg-destructive-subtle text-destructive"
                )}
              >
                {state.evaluation.result}
              </Badge>
            </div>
            <p className="text-sm text-foreground">{state.evaluation.summary}</p>
            <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
              <div>
                <dt>Accuracy</dt>
                <dd className="font-medium text-foreground">
                  {state.evaluation.metrics.accuracy}%
                </dd>
              </div>
              <div>
                <dt>Compliance</dt>
                <dd className="font-medium text-foreground">
                  {state.evaluation.metrics.compliance}%
                </dd>
              </div>
              <div>
                <dt>Tone</dt>
                <dd className="font-medium text-foreground">
                  {state.evaluation.metrics.tone}%
                </dd>
              </div>
              <div>
                <dt>Hallucination risk</dt>
                <dd className="font-medium text-foreground">
                  {state.evaluation.metrics.hallucination_risk}%
                </dd>
              </div>
            </dl>
            {state.evaluation.recommendations && state.evaluation.recommendations.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                {state.evaluation.recommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {state.runId && (
              <p className="text-xs text-success">Saved to run history.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
