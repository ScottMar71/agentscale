import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RunScenarioPanel } from "@/components/scenarios/run-scenario-panel";
import { RecentRunsTable } from "@/components/scenarios/recent-runs-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Pencil } from "lucide-react";
import { listAgents } from "@/lib/data/agents";
import { getTestScenario, listRunsForScenario } from "@/lib/data/scenarios";
import { parsePassCriteria } from "@/lib/schemas/scenario";

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [scenario, agents, runs] = await Promise.all([
    getTestScenario(id),
    listAgents(),
    listRunsForScenario(id),
  ]);

  if (!scenario) notFound();

  const criteria = parsePassCriteria(scenario.pass_criteria as Record<string, unknown>);

  return (
    <>
      <DashboardHeader title={scenario.name} description="Run evaluations against agents" />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/scenarios"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 inline-flex")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Link>
          <Link
            href={`/dashboard/scenarios/${id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Link>
          {scenario.is_published === false && <Badge variant="outline">Draft</Badge>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scenario definition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="whitespace-pre-wrap text-foreground">{scenario.prompt}</p>
            {scenario.expected_behaviour && (
              <p>
                <span className="text-muted-foreground">Expected: </span>
                {scenario.expected_behaviour}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Pass threshold: {criteria.min_score ?? 80} · {scenario.run_count ?? 0} total runs
            </p>
          </CardContent>
        </Card>

        <RunScenarioPanel scenario={scenario} agents={agents} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run history</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentRunsTable runs={runs} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
