"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateIncident, triggerIncidentReassessmentFromForm, type IncidentActionState } from "@/app/actions/incidents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Incident } from "@/types";

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning-subtle text-warning",
  high: "bg-warning-subtle text-warning",
  critical: "bg-destructive-subtle text-destructive",
};

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface IncidentListProps {
  incidents: Incident[];
  canWrite: boolean;
}

export function IncidentList({ incidents, canWrite }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No incidents logged yet. Use the form above to record agent issues and track remediation.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((inc) => (
        <IncidentCard key={inc.id} incident={inc} canWrite={canWrite} />
      ))}
    </div>
  );
}

function IncidentCard({ incident, canWrite }: { incident: Incident; canWrite: boolean }) {
  const [state, action, pending] = useActionState<IncidentActionState, FormData>(updateIncident, {});

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">{incident.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/dashboard/agents/${incident.agent_id}`} className="hover:underline">
              {incident.agent_name}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={cn("capitalize", severityColors[incident.severity])}>
            {incident.severity}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {incident.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {incident.description && (
          <p className="text-muted-foreground">{incident.description}</p>
        )}
        {incident.root_cause && (
          <p>
            <span className="font-medium text-foreground">Root cause:</span> {incident.root_cause}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70">
          {format(new Date(incident.created_at), "dd MMM yyyy HH:mm")}
        </p>

        {incident.reassessment_scenario_id && (
          <p className="text-sm">
            <span className="font-medium text-foreground">Reassessment:</span>{" "}
            <Link
              href={`/dashboard/scenarios/${incident.reassessment_scenario_id}`}
              className="text-primary hover:underline"
            >
              Run scenario
            </Link>
          </p>
        )}

        {canWrite && incident.status !== "closed" && !incident.reassessment_scenario_id && (
          <form action={triggerIncidentReassessmentFromForm}>
            <input type="hidden" name="incidentId" value={incident.id} />
            <Button type="submit" variant="secondary" size="sm">
              Trigger reassessment
            </Button>
          </form>
        )}

        {canWrite && incident.status !== "closed" && (
          <form action={action} className="space-y-3 rounded-lg border border-border p-4">
            <input type="hidden" name="incident_id" value={incident.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`status-${incident.id}`}>Status</Label>
                <select
                  id={`status-${incident.id}`}
                  name="status"
                  className={selectClass}
                  defaultValue={incident.status}
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`root-${incident.id}`}>Root cause</Label>
                <textarea
                  id={`root-${incident.id}`}
                  name="root_cause"
                  rows={2}
                  className={selectClass + " min-h-[60px] py-2"}
                  defaultValue={incident.root_cause ?? ""}
                  placeholder="Document root cause when known"
                />
              </div>
            </div>
            {state.error && <p className="text-xs text-destructive">{state.error}</p>}
            {state.success && <p className="text-xs text-success">{state.success}</p>}
            <Button type="submit" variant="outline" size="sm" disabled={pending}>
              Update incident
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
