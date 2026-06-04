"use client";

import { useActionState } from "react";
import { assignTrainingProgram, type FormState } from "@/app/actions/training";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingProgram } from "@/types";

const initial: FormState = {};
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AssignProgrammePanel({
  programs,
  agents,
}: {
  programs: TrainingProgram[];
  agents: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(assignTrainingProgram, initial);

  if (programs.length === 0 || agents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assign programme to agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="agent_id">Agent</Label>
            <select id="agent_id" name="agent_id" required className={selectClass} defaultValue="">
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
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="program_id">Programme</Label>
            <select id="program_id" name="program_id" required className={selectClass} defaultValue="">
              <option value="" disabled>
                Select programme
              </option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Assigning…" : "Assign"}
          </Button>
        </form>
        {state.message && (
          <p role="status" className="mt-3 text-sm text-success">
            {state.message}
          </p>
        )}
        {state.error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
