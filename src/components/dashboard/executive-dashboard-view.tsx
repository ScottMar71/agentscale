import Link from "next/link";
import {
  Bot,
  Award,
  AlertTriangle,
  PoundSterling,
  Activity,
  Shield,
  Sparkles,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExecutiveCharts } from "@/components/dashboard/executive-charts";
import { ExecutiveChartsLive } from "@/components/dashboard/executive-charts-live";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { DashboardStats } from "@/types";

export function ExecutiveDashboardView({
  stats,
  variant,
}: {
  stats: DashboardStats;
  variant: "live" | "demo";
}) {
  const isDemo = variant === "demo";
  const certCoverage =
    stats.totalAgents > 0
      ? Math.round((stats.certifiedAgents / stats.totalAgents) * 100)
      : 0;

  return (
    <>
      <DashboardHeader
        title="Executive Dashboard"
        description={
          isDemo
            ? "Sample AI workforce metrics for sales demos and product walkthroughs"
            : "AI workforce health, certification coverage, and risk exposure"
        }
        badge={isDemo ? "Demo data" : stats.totalAgents > 0 ? "Live" : undefined}
        badgeVariant={isDemo ? "demo" : "live"}
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        {!isDemo && stats.totalAgents === 0 && (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-medium text-foreground">No agents in this workspace yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Register agents to populate live metrics, or explore the pre-built demo
                    dashboard.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/agents/new" className={buttonVariants({ size: "sm" })}>
                  Register agent
                </Link>
                <Link
                  href="/dashboard/demo"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View demo dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isDemo && (
          <Card className="border-primary/20 bg-info-subtle">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                This page uses fictional sample data. Your live workspace is at the executive
                dashboard.
              </p>
              <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Go to live dashboard
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="AI Workforce"
            value={stats.totalAgents}
            subtitle="Registered agents"
            icon={Bot}
          />
          <StatCard
            title="Certified"
            value={stats.certifiedAgents}
            subtitle={
              stats.totalAgents > 0 ? `${certCoverage}% coverage` : "No agents yet"
            }
            icon={Award}
            variant="success"
          />
          <StatCard
            title="Utilisation"
            value={`${stats.utilization}%`}
            subtitle="Active in production"
            icon={Activity}
          />
          <StatCard
            title="Avg Health"
            value={stats.avgHealthScore || "—"}
            subtitle="0–100 score"
            icon={Activity}
          />
          <StatCard
            title="At Risk"
            value={stats.highRiskAgents}
            subtitle="High/critical risk agents"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="Est. Savings"
            value={
              isDemo
                ? `£${(stats.estimatedSavings / 1e6).toFixed(1)}M`
                : stats.estimatedSavings > 0
                  ? `£${(stats.estimatedSavings / 1e6).toFixed(1)}M`
                  : "—"
            }
            subtitle={isDemo ? "Annual (modelled)" : "Modelled savings (Sprint 5+)"}
            icon={PoundSterling}
          />
        </div>

        {isDemo ? <ExecutiveCharts /> : <ExecutiveChartsLive />}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-warning-subtle">
            <CardContent className="flex items-center gap-3 pt-6">
              <Award className="h-8 w-8 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">
                  {stats.expiringCerts}
                </p>
                <p className="text-xs text-muted-foreground">Expiring certifications (30d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive-subtle">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertTriangle className="h-8 w-8 shrink-0 text-destructive" aria-hidden />
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">
                  {stats.failedAssessments}
                </p>
                <p className="text-xs text-muted-foreground">Failed assessments (7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="flex items-center gap-3 pt-6">
              <Shield className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">
                  Governance posture:{" "}
                  {isDemo
                    ? "Strong"
                    : stats.totalAgents === 0
                      ? "Not assessed"
                      : certCoverage >= 80
                        ? "Strong"
                        : certCoverage >= 50
                          ? "Moderate"
                          : "Needs attention"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isDemo
                    ? "81% certification coverage · 4 agents require immediate review"
                    : stats.totalAgents > 0
                      ? `${certCoverage}% certification coverage · ${stats.highRiskAgents} high-risk agents`
                      : "Register agents and run scenarios to build your posture score"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
