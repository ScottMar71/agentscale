"use client";

import { useActionState } from "react";
import { requestCertification, type CertificationActionState } from "@/app/actions/certifications";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agent, Certification } from "@/types";
import type { CertificationRules } from "@/lib/schemas/certification";

const initial: CertificationActionState = {};
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function RequestCertificationForm({
  agents,
  definitions,
  canRequest,
}: {
  agents: Agent[];
  definitions: (Certification & { rules: CertificationRules })[];
  canRequest: boolean;
}) {
  const [state, action, pending] = useActionState(requestCertification, initial);

  if (!canRequest) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Viewers cannot submit certification requests. Contact an org admin or manager.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Request certification</CardTitle>
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
            <Label htmlFor="certification_id">Certification</Label>
            <select
              id="certification_id"
              name="certification_id"
              required
              className={selectClass}
              defaultValue=""
            >
              <option value="" disabled>
                Select certification
              </option>
              {definitions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={pending || agents.length === 0}>
            {pending ? "Submitting…" : "Request"}
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
