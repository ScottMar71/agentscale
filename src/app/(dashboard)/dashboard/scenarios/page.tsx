import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoScenarios, demoScenarioRuns } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoScenarios.map((s) => (
            <Card key={s.id} className="border-slate-200">
              <CardHeader>
                <FlaskConical className="h-5 w-5 text-[#2563EB]" />
                <CardTitle className="text-base mt-2">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-600 line-clamp-3">{s.prompt}</p>
                <p className="text-xs text-slate-500">
                  Expected: {s.expected_behaviour}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {s.run_count} runs · Min score{" "}
                  {(s.pass_criteria as { min_score?: number }).min_score ?? 80}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200">
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
                        className={
                          run.result === "pass"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {run.result}
                      </Badge>
                    </TableCell>
                    <TableCell>{run.metrics.compliance}%</TableCell>
                    <TableCell className="max-w-xs truncate text-slate-500 text-sm">
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
