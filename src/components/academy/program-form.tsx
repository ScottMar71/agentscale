"use client";

import { useActionState } from "react";
import { createTrainingProgram, type FormState } from "@/app/actions/training";
import { CERTIFICATION_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: FormState = {};
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const textareaClass =
  "flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProgramForm() {
  const [state, action, pending] = useActionState(createTrainingProgram, initial);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Programme title</Label>
        <Input id="title" name="title" required placeholder="Customer Support Certification" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          className={textareaClass}
          placeholder="What agents will learn in this programme"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="certification_type">Certification type</Label>
        <select id="certification_type" name="certification_type" className={selectClass} defaultValue="">
          <option value="">None</option>
          {CERTIFICATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="is_published">Published</Label>
        <select id="is_published" name="is_published" className={selectClass} defaultValue="false">
          <option value="false">Draft</option>
          <option value="true">Published</option>
        </select>
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating…" : "Create programme"}
      </Button>
    </form>
  );
}
