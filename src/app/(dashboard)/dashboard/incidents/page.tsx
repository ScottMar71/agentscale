import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoIncidents } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning-subtle text-warning",
  high: "bg-warning-subtle text-warning",
  critical: "bg-destructive-subtle text-destructive",
};

export default function IncidentsPage() {
  return (
    <>
      <DashboardHeader
        title="Continuous Improvement"
        description="Incident management, root cause analysis, and remediation workflows"
        action={{ label: "Log incident" }}
      />
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        <Card className="bg-muted">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            When an issue occurs: incident logged → root cause recorded → new training
            scenario created → reassessment triggered → certification reviewed.
          </CardContent>
        </Card>

        {demoIncidents.map((inc) => (
          <Card key={inc.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{inc.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{inc.agent_name}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={cn("capitalize", severityColors[inc.severity])}>{inc.severity}</Badge>
                <Badge variant="outline" className="capitalize">{inc.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{inc.description}</p>
              {inc.root_cause && (
                <p>
                  <span className="font-medium text-foreground">Root cause:</span>{" "}
                  {inc.root_cause}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70">
                {format(new Date(inc.created_at), "dd MMM yyyy HH:mm")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
