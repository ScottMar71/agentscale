import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoScenarios, demoScenarioRuns } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlaskConical } from "lucide-react";

export default function ScenariosPage() {
  return (
    <>
      <DashboardHeader
        title="Scenario Testing Engine"
        description="Define scenarios, run AI evaluations, and store pass/fail results"
        action={{ label: "New scenario" }}
        badge="Core feature"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoScenarios.map((s) => (
            <Card key={s.id} className="transition-shadow duration-200 hover:shadow-md">
              <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-lg bg-info-subtle text-primary">
                  <FlaskConical className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle className="mt-2 text-base">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="line-clamp-3 text-muted-foreground">{s.prompt}</p>
                <p className="text-xs text-muted-foreground">
                  Expected: {s.expected_behaviour}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {s.run_count} runs · Min score{" "}
                  {(s.pass_criteria as { min_score?: number }).min_score ?? 80}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent evaluation runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoScenarioRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.agent_name}</TableCell>
                    <TableCell>{run.score}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "capitalize",
                          run.result === "pass"
                            ? "bg-success-subtle text-success"
                            : "bg-destructive-subtle text-destructive"
                        )}
                      >
                        {run.result}
                      </Badge>
                    </TableCell>
                    <TableCell>{run.metrics.compliance}%</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {run.evaluation_summary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
