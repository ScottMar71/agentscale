"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { rollbackToVersionFromForm } from "@/app/actions/versions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import type { AgentVersion } from "@/types";

const selectClass =
  "h-9 w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface VersionTimelineProps {
  agents: { id: string; name: string }[];
  selectedAgentId: string | null;
  selectedAgentName: string;
  versions: AgentVersion[];
  canWrite: boolean;
}

export function VersionTimeline({
  agents,
  selectedAgentId,
  selectedAgentName,
  versions,
  canWrite,
}: VersionTimelineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onAgentChange(agentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (agentId) {
      params.set("agent", agentId);
    } else {
      params.delete("agent");
    }
    const qs = params.toString();
    router.push(qs ? `/dashboard/versions?${qs}` : "/dashboard/versions");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="version-agent" className="text-sm font-medium text-foreground">
          Select agent
        </label>
        <select
          id="version-agent"
          className={selectClass}
          value={selectedAgentId ?? ""}
          onChange={(e) => onAgentChange(e.target.value)}
        >
          <option value="">Choose an agent…</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedAgentId ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Select an agent to view prompt and model version history.
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle>{selectedAgentName} — Version timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No versions recorded yet. Edit the agent to create the first snapshot.
              </p>
            ) : (
              <ul className="relative ml-3 space-y-8 border-l border-border pl-8">
                {versions.map((v) => (
                  <li key={v.id} className="relative">
                    <span className="absolute -left-[2.4rem] flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-card" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-heading font-semibold text-foreground">v{v.version_label}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.model_provider ?? "Unknown provider"}
                          {v.model_version ? ` · ${v.model_version}` : ""} ·{" "}
                          {new Date(v.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {v.is_current ? (
                          <Badge>Current</Badge>
                        ) : canWrite ? (
                          <form
                            action={rollbackToVersionFromForm}
                            onSubmit={() =>
                              startTransition(() => {
                                /* pending state handled by transition */
                              })
                            }
                          >
                            <input type="hidden" name="agentId" value={selectedAgentId} />
                            <input type="hidden" name="versionId" value={v.id} />
                            <Button type="submit" variant="outline" size="sm" disabled={pending}>
                              Rollback
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
