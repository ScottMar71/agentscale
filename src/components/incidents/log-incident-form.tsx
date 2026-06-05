"use client";

import { useActionState } from "react";
import { logIncident, type IncidentActionState } from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface LogIncidentFormProps {
  agents: { id: string; name: string }[];
}

export function LogIncidentForm({ agents }: LogIncidentFormProps) {
  const [state, action, pending] = useActionState<IncidentActionState, FormData>(logIncident, {});

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Register an agent before logging incidents.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Log incident</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="agent_id">Agent</Label>
              <select id="agent_id" name="agent_id" className={selectClass} required>
                <option value="">Select agent…</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.agent_id && (
                <p className="text-xs text-destructive">{state.fieldErrors.agent_id[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="severity">Severity</Label>
              <select id="severity" name="severity" className={selectClass} defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Brief summary of the issue" required />
            {state.fieldErrors?.title && (
              <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={selectClass + " min-h-[80px] py-2"}
              placeholder="What happened? Include customer impact if known."
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state.success && (
            <p role="status" className="text-sm text-success">
              {state.success}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            Log incident
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
