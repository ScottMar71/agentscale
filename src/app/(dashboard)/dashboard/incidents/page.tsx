import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoIncidents } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const severityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

export default function IncidentsPage() {
  return (
    <>
      <DashboardHeader
        title="Continuous Improvement"
        description="Incident management, root cause analysis, and remediation workflows"
        action={{ label: "Log incident" }}
      />
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-6 text-sm text-slate-600">
            When an issue occurs: incident logged → root cause recorded → new training
            scenario created → reassessment triggered → certification reviewed.
          </CardContent>
        </Card>

        {demoIncidents.map((inc) => (
          <Card key={inc.id} className="border-slate-200">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{inc.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{inc.agent_name}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={severityColors[inc.severity]}>{inc.severity}</Badge>
                <Badge variant="outline">{inc.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-slate-600">{inc.description}</p>
              {inc.root_cause && (
                <p>
                  <span className="font-medium text-[#0B1426]">Root cause:</span>{" "}
                  {inc.root_cause}
                </p>
              )}
              <p className="text-xs text-slate-400">
                {format(new Date(inc.created_at), "dd MMM yyyy HH:mm")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
