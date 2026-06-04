import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { demoStats } from "@/lib/demo-data";
import {
  Bot,
  Award,
  AlertTriangle,
  PoundSterling,
  Activity,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ExecutiveCharts } from "@/components/dashboard/executive-charts";

export default function ExecutiveDashboardPage() {
  const s = demoStats;

  return (
    <>
      <DashboardHeader
        title="Executive Dashboard"
        description="AI workforce health, certification coverage, and risk exposure"
        badge="Live"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="AI Workforce" value={s.totalAgents} subtitle="Registered agents" icon={Bot} />
          <StatCard
            title="Certified"
            value={s.certifiedAgents}
            subtitle={`${Math.round((s.certifiedAgents / s.totalAgents) * 100)}% coverage`}
            icon={Award}
            variant="success"
          />
          <StatCard title="Utilisation" value={`${s.utilization}%`} subtitle="Active in production" icon={Activity} />
          <StatCard title="Avg Health" value={s.avgHealthScore} subtitle="0–100 score" icon={Activity} />
          <StatCard
            title="At Risk"
            value={s.highRiskAgents}
            subtitle="High/critical risk agents"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="Est. Savings"
            value={`£${(s.estimatedSavings / 1e6).toFixed(1)}M`}
            subtitle="Annual (modelled)"
            icon={PoundSterling}
          />
        </div>

        <ExecutiveCharts />

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-warning-subtle">
            <CardContent className="flex items-center gap-3 pt-6">
              <Award className="h-8 w-8 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">{s.expiringCerts}</p>
                <p className="text-xs text-muted-foreground">Expiring certifications (30d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive-subtle">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertTriangle className="h-8 w-8 shrink-0 text-destructive" aria-hidden />
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">{s.failedAssessments}</p>
                <p className="text-xs text-muted-foreground">Failed assessments (7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="flex items-center gap-3 pt-6">
              <Shield className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">Governance posture: Strong</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  81% certification coverage · 4 agents require immediate review
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
