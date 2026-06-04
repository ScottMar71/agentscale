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
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
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
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <Award className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-semibold text-[#0B1426]">{s.expiringCerts}</p>
                <p className="text-xs text-slate-600">Expiring certifications (30d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-semibold text-[#0B1426]">{s.failedAssessments}</p>
                <p className="text-xs text-slate-600">Failed assessments (7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 col-span-2">
            <CardContent className="flex items-center gap-3 pt-6">
              <Shield className="h-8 w-8 text-[#2563EB]" />
              <div>
                <p className="font-medium text-[#0B1426]">Governance posture: Strong</p>
                <p className="text-xs text-slate-600 mt-1">
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
