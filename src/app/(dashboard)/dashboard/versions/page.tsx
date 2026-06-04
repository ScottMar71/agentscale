import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoAgents, demoVersions } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";

export default function VersionControlPage() {
  const agent = demoAgents.find((a) => a.id === "a1");
  const versions = demoVersions.filter((v) => v.agent_id === "a1");

  return (
    <>
      <DashboardHeader
        title="Agent Version Control"
        description="Prompt, model, and knowledge base version timeline with rollback"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle>{agent?.name ?? "Agent"} — Version timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="relative ml-3 space-y-8 border-l border-border pl-8">
              {versions.map((v) => (
                <li key={v.id} className="relative">
                  <span className="absolute -left-[2.4rem] flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-card" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-heading font-semibold text-foreground">v{v.version_label}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.model_provider} ·{" "}
                        {new Date(v.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.is_current ? (
                        <Badge>Current</Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
