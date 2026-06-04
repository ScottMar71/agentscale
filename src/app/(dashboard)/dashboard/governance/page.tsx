import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoStats, demoAuditLogs } from "@/lib/demo-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Bot, Award, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function GovernancePage() {
  const s = demoStats;

  return (
    <>
      <DashboardHeader
        title="Governance Centre"
        description="Compliance visibility, risk exposure, and immutable audit logs"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total agents" value={s.totalAgents} icon={Bot} />
          <StatCard title="Certified" value={s.certifiedAgents} icon={Award} variant="success" />
          <StatCard
            title="Expiring certs"
            value={s.expiringCerts}
            icon={Award}
            variant="warning"
          />
          <StatCard
            title="High-risk agents"
            value={s.highRiskAgents}
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        <Card className="bg-info-subtle ring-primary/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <Shield className="h-10 w-10 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">Compliance posture</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {s.failedAssessments} failed assessments in the last 7 days require
                remediation. All prompt and model changes are logged below.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {demoAuditLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col border-b border-border pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium capitalize text-foreground">
                      {log.action.replace("_", " ")} — {log.entity_type}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {log.actor_name} ·{" "}
                      {JSON.stringify(log.metadata).slice(0, 80)}…
                    </p>
                  </div>
                  <span className="mt-1 text-xs text-muted-foreground/70 sm:mt-0">
                    {format(new Date(log.created_at), "dd MMM yyyy HH:mm")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
