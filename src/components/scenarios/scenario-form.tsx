"use client";

import { useActionState } from "react";
import {
  createTestScenario,
  updateTestScenarioAction,
  type ScenarioFormState,
} from "@/app/actions/scenarios";
import { parsePassCriteria } from "@/lib/schemas/scenario";
import type { TestScenario } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ScenarioFormState = {};
const textareaClass =
  "flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ScenarioForm({
  mode,
  scenario,
}: {
  mode: "create" | "edit";
  scenario?: TestScenario;
}) {
  const criteria = scenario
    ? parsePassCriteria(scenario.pass_criteria as Record<string, unknown>)
    : { min_score: 80 };

  const action =
    mode === "create"
      ? createTestScenario
      : updateTestScenarioAction.bind(null, scenario!.id);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Scenario name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={scenario?.name}
          placeholder="Customer requests refund"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="prompt">Scenario prompt</Label>
        <textarea
          id="prompt"
          name="prompt"
          required
          className={textareaClass}
          defaultValue={scenario?.prompt}
          placeholder="Describe the situation the agent must handle"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expected_behaviour">Expected behaviour</Label>
        <textarea
          id="expected_behaviour"
          name="expected_behaviour"
          className={textareaClass}
          defaultValue={scenario?.expected_behaviour ?? ""}
          placeholder="What a compliant response should do"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="min_score">Pass threshold (0–100)</Label>
          <Input
            id="min_score"
            name="min_score"
            type="number"
            min={0}
            max={100}
            defaultValue={criteria.min_score ?? 80}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="is_published">Status</Label>
          <select
            id="is_published"
            name="is_published"
            className={selectClass}
            defaultValue={scenario?.is_published === false ? "false" : "true"}
          >
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : mode === "create" ? "Create scenario" : "Save changes"}
      </Button>
    </form>
  );
}
