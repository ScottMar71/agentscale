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
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
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

        <Card className="border-[#2563EB]/30 bg-blue-50/30">
          <CardContent className="flex items-center gap-4 pt-6">
            <Shield className="h-10 w-10 text-[#2563EB]" />
            <div>
              <p className="font-semibold text-[#0B1426]">Compliance posture</p>
              <p className="text-sm text-slate-600 mt-1">
                {s.failedAssessments} failed assessments in the last 7 days require
                remediation. All prompt and model changes are logged below.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {demoAuditLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0B1426]">
                      {log.action.replace("_", " ")} — {log.entity_type}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {log.actor_name} ·{" "}
                      {JSON.stringify(log.metadata).slice(0, 80)}…
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 sm:mt-0">
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
