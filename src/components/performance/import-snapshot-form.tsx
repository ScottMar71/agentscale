"use client";

import { useActionState } from "react";
import { importPerformanceSnapshot, type PerformanceActionState } from "@/app/actions/performance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface ImportSnapshotFormProps {
  agents: { id: string; name: string }[];
}

export function ImportSnapshotForm({ agents }: ImportSnapshotFormProps) {
  const [state, action, pending] = useActionState<PerformanceActionState, FormData>(
    importPerformanceSnapshot,
    {}
  );

  if (agents.length === 0) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 8)}01`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Import performance snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="perf-agent">Agent</Label>
              <select id="perf-agent" name="agent_id" className={selectClass} required>
                <option value="">Select agent…</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="period_start">Period start</Label>
              <Input id="period_start" name="period_start" type="date" defaultValue={monthStart} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="period_end">Period end</Label>
              <Input id="period_end" name="period_end" type="date" defaultValue={today} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["accuracy", "Accuracy %"],
              ["success_rate", "Success rate %"],
              ["escalation_rate", "Escalation %"],
              ["hallucination_rate", "Hallucination %"],
              ["error_rate", "Error rate %"],
              ["health_score", "Health score"],
              ["cost_per_task", "Cost / task"],
              ["avg_response_time_ms", "Avg response (ms)"],
            ].map(([name, label]) => (
              <div key={name} className="space-y-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} name={name} type="number" step="0.01" min="0" />
              </div>
            ))}
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-success">{state.success}</p>}
          <Button type="submit" disabled={pending}>
            Import snapshot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
