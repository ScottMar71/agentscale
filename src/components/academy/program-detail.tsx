"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  addTrainingModule,
  uploadModuleContent,
  type FormState,
} from "@/app/actions/training";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrainingProgramDetail } from "@/types";
import { FileText, Upload } from "lucide-react";

const initial: FormState = {};
const textareaClass =
  "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProgramDetail({ program }: { program: TrainingProgramDetail }) {
  const addModuleAction = addTrainingModule.bind(null, program.id);
  const [moduleState, moduleFormAction, modulePending] = useActionState(
    addModuleAction,
    initial
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-semibold">{program.title}</h2>
          {program.is_published ? (
            <Badge className="bg-success-subtle text-success">Published</Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
        {program.description && (
          <p className="mt-2 text-muted-foreground">{program.description}</p>
        )}
        {program.certification_type && (
          <p className="mt-1 text-sm text-muted-foreground">
            Leads to: {program.certification_type}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modules ({program.modules.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {program.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules yet. Add the first one below.</p>
          ) : (
            <ul className="space-y-4">
              {program.modules.map((mod) => (
                <li key={mod.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {mod.sort_order}. {mod.title}
                      </p>
                      {mod.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
                      )}
                      {mod.content.body && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          {mod.content.body}
                        </p>
                      )}
                      {mod.content.file_name && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-primary">
                          <FileText className="h-3.5 w-3.5" aria-hidden />
                          {mod.content.file_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <ModuleUploadForm programId={program.id} moduleId={mod.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add module</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={moduleFormAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="module-title">Title</Label>
              <Input id="module-title" name="title" required placeholder="Escalation handling" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="module-description">Description</Label>
              <Input id="module-description" name="description" placeholder="Optional summary" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Lesson content (text)</Label>
              <textarea
                id="body"
                name="body"
                className={textareaClass}
                placeholder="Optional inline training content"
              />
            </div>
            {moduleState.message && (
              <p role="status" className="text-sm text-success">
                {moduleState.message}
              </p>
            )}
            {moduleState.error && (
              <p role="alert" className="text-sm text-destructive">
                {moduleState.error}
              </p>
            )}
            <Button type="submit" disabled={modulePending}>
              {modulePending ? "Adding…" : "Add module"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Link href="/dashboard/academy">
        <Button variant="outline">Back to Academy</Button>
      </Link>
    </div>
  );
}

function ModuleUploadForm({
  programId,
  moduleId,
}: {
  programId: string;
  moduleId: string;
}) {
  const uploadAction = uploadModuleContent.bind(null, programId, moduleId);
  const [state, formAction, pending] = useActionState(uploadAction, initial);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <div className="min-w-[200px] flex-1 space-y-1">
        <Label htmlFor={`file-${moduleId}`} className="text-xs">
          Upload file (PDF, txt, md — max 10 MB)
        </Label>
        <Input
          id={`file-${moduleId}`}
          name="file"
          type="file"
          accept=".pdf,.txt,.md,.json,text/plain,text/markdown,application/pdf"
          className="text-xs"
        />
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        <Upload className="h-3.5 w-3.5" aria-hidden />
        {pending ? "Uploading…" : "Upload"}
      </Button>
      {state.message && (
        <p className="w-full text-xs text-success">{state.message}</p>
      )}
      {state.error && (
        <p className="w-full text-xs text-destructive">{state.error}</p>
      )}
    </form>
  );
}
