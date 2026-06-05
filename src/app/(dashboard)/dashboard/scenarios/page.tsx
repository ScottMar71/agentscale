import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ScenarioGrid } from "@/components/scenarios/scenario-grid";
import { RecentRunsTable } from "@/components/scenarios/recent-runs-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTestScenarios, listScenarioRuns } from "@/lib/data/scenarios";

export default async function ScenariosPage() {
  const [scenarios, runs] = await Promise.all([
    listTestScenarios(),
    listScenarioRuns(25),
  ]);

  return (
    <>
      <DashboardHeader
        title="Scenario Testing Engine"
        description="Define scenarios, run AI evaluations, and store pass/fail results"
        action={{ label: "New scenario", href: "/dashboard/scenarios/new" }}
        badge="Core feature"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <ScenarioGrid scenarios={scenarios} />
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
