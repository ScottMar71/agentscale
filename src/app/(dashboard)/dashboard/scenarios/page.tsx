import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ScenarioGrid } from "@/components/scenarios/scenario-grid";
import { RecentRunsTable } from "@/components/scenarios/recent-runs-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTestScenarios, listScenarioRuns } from "@/lib/data/scenarios";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";

export default async function ScenariosPage() {
  const [scenarios, runs, org] = await Promise.all([
    listTestScenarios(),
    listScenarioRuns(25),
    getCurrentOrganization(),
  ]);
  const canWrite = canWriteOrg(org?.role);

  return (
    <>
      <DashboardHeader
        title="Scenario Testing Engine"
        description="Define scenarios, run AI evaluations, and store pass/fail results"
        action={canWrite ? { label: "New scenario", href: "/dashboard/scenarios/new" } : undefined}
        badge="Core feature"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <ScenarioGrid scenarios={scenarios} canWrite={canWrite} />
        <Card>
          <CardHeader>
            <CardTitle>Recent evaluation runs</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentRunsTable runs={runs} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
