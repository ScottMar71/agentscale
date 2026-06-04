"use client";

import { useActionState } from "react";
import Link from "next/link";
import { assignTrainingProgram, type FormState } from "@/app/actions/training";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { AgentTrainingAssignment, TrainingProgram } from "@/types";

const initial: FormState = {};
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AgentTrainingPanel({
  agentId,
  agentName,
  programs,
  assignments,
}: {
  agentId: string;
  agentName: string;
  programs: TrainingProgram[];
  assignments: AgentTrainingAssignment[];
}) {
  const [state, action, pending] = useActionState(assignTrainingProgram, initial);

  return (
    <div className="space-y-6">
      {assignments.length > 0 ? (
        <ul className="space-y-4">
          {assignments.map((a) => (
            <li key={a.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{a.program_title}</p>
                <span className="text-sm text-muted-foreground">
                  {a.modules_completed}/{a.total_modules} modules
                </span>
              </div>
              <Progress value={a.percent_complete} className="mt-3" />
              <p className="mt-1 text-xs text-muted-foreground">
                {a.percent_complete}% complete
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No programmes assigned to {agentName} yet.
        </p>
      )}

      {programs.length > 0 ? (
        <form action={action} className="space-y-3 rounded-lg border border-border p-4">
          <input type="hidden" name="agent_id" value={agentId} />
          <div className="space-y-1.5">
            <Label htmlFor={`program-${agentId}`}>Assign programme</Label>
            <select
              id={`program-${agentId}`}
              name="program_id"
              required
              className={selectClass}
              defaultValue=""
            >
              <option value="" disabled>
                Select programme
              </option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.is_published ? "" : " (draft)"}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Assigning…" : "Assign programme"}
          </Button>
          {state.message && (
            <p role="status" className="text-sm text-success">
              {state.message}
            </p>
          )}
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Create a programme in the Academy first.
        </p>
      )}

      <Link href="/dashboard/academy" className={buttonVariants({ variant: "outline", size: "sm" })}>
        Manage programmes
      </Link>
    </div>
  );
}
