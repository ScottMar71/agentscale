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
      <div className="flex-1 overflow-y-auto p-8">
        <Card className="border-slate-200 max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-[#2563EB]" />
              <CardTitle>{agent?.name ?? "Agent"} — Version timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="relative border-l border-slate-200 ml-3 space-y-8 pl-8">
              {versions.map((v) => (
                <li key={v.id} className="relative">
                  <span className="absolute -left-[2.4rem] flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-[#2563EB]" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#0B1426]">v{v.version_label}</p>
                      <p className="text-xs text-slate-500">
                        {v.model_provider} ·{" "}
                        {new Date(v.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.is_current ? (
                        <Badge className="bg-[#2563EB] text-white">Current</Badge>
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
