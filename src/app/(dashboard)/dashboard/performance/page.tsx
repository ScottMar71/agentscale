import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ImportSnapshotForm } from "@/components/performance/import-snapshot-form";
import { PerformanceScorecards } from "@/components/performance/performance-scorecards";
import { Card, CardContent } from "@/components/ui/card";
import {
  computePerformanceSummary,
  listLatestPerformanceSnapshots,
} from "@/lib/data/performance";
import { listAgentsForIncidentForm } from "@/lib/data/incidents";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";

function formatPercent(value: number | null) {
  return value != null ? `${Math.round(value)}%` : "—";
}

function formatCost(value: number | null) {
  return value != null ? `£${value.toFixed(2)}` : "—";
}

function formatMs(value: number | null) {
  return value != null ? `${(value / 1000).toFixed(1)}s` : "—";
}

export default async function PerformancePage() {
  const [{ snapshots, isDemo }, agents, org] = await Promise.all([
    listLatestPerformanceSnapshots(),
    listAgentsForIncidentForm(),
    getCurrentOrganization(),
  ]);
  const summary = computePerformanceSummary(snapshots);
  const canWrite = canWriteOrg(org?.role);

  return (
    <>
      <DashboardHeader
        title="Performance Management"
        description="AI agent scorecards, health scores, and operational KPIs"
        badge={isDemo ? "Demo data" : undefined}
        badgeVariant={isDemo ? "demo" : "live"}
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Avg accuracy", value: formatPercent(summary.avgAccuracy) },
            { label: "Success rate", value: formatPercent(summary.avgSuccessRate) },
            { label: "Avg cost/task", value: formatCost(summary.avgCostPerTask) },
            { label: "Avg response", value: formatMs(summary.avgResponseMs) },
          ].map((m) => (
            <Card key={m.label} className="transition-shadow duration-200 hover:shadow-md">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-heading text-2xl font-semibold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {canWrite && !isDemo && <ImportSnapshotForm agents={agents} />}

        {!isDemo && (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Webhook: POST <code className="text-foreground">/api/performance/webhook</code> with{" "}
              <code className="text-foreground">Authorization: Bearer $PERFORMANCE_WEBHOOK_SECRET</code>
            </CardContent>
          </Card>
        )}

        <PerformanceScorecards snapshots={snapshots} />
      </div>
    </>
  );
}
