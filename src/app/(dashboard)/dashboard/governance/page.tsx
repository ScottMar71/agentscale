import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AuditLogList } from "@/components/governance/audit-log-list";
import { AuditExportButton } from "@/components/governance/audit-export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getGovernanceOverview } from "@/lib/data/governance";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";
import { Shield, Bot, Award, AlertTriangle } from "lucide-react";

export default async function GovernancePage() {
  const [{ stats, auditLogs, isDemo }, org] = await Promise.all([
    getGovernanceOverview(),
    getCurrentOrganization(),
  ]);
  const canWrite = canWriteOrg(org?.role);

  return (
    <>
      <DashboardHeader
        title="Governance Centre"
        description="Compliance visibility, risk exposure, and immutable audit logs"
        badge={isDemo ? "Demo data" : undefined}
        badgeVariant={isDemo ? "demo" : "live"}
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        {isDemo && (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing sample governance data. Connect Supabase and use your workspace for live
                audit logs.
              </p>
              <Link href="/dashboard/demo" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Demo dashboard
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total agents" value={stats.totalAgents} icon={Bot} />
          <StatCard
            title="Certified"
            value={stats.certifiedAgents}
            icon={Award}
            variant="success"
          />
          <StatCard
            title="Expiring certs"
            value={stats.expiringCerts}
            icon={Award}
            variant="warning"
          />
          <StatCard
            title="High-risk agents"
            value={stats.highRiskAgents}
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
                {stats.failedAssessments} failed assessments in the last 7 days.
                {stats.totalAgents > 0
                  ? ` ${stats.highRiskAgents} high-risk agents under review.`
                  : " Register agents to begin governance tracking."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Audit log</CardTitle>
            <AuditExportButton disabled={isDemo || !isAuthEnabled() || !canWrite} />
          </CardHeader>
          <CardContent>
            <AuditLogList logs={auditLogs} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
