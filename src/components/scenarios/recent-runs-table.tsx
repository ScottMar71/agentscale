import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ScenarioRun } from "@/types";
import { format } from "date-fns";

export function RecentRunsTable({ runs }: { runs: ScenarioRun[] }) {
  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No evaluation runs yet. Open a scenario and run a test against an agent.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scenario</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Compliance</TableHead>
          <TableHead>When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="font-medium">{run.scenario_name ?? "—"}</TableCell>
            <TableCell>{run.agent_name ?? "—"}</TableCell>
            <TableCell>{run.score ?? "—"}</TableCell>
            <TableCell>
              <Badge
                className={cn(
                  "capitalize",
                  run.result === "pass"
                    ? "bg-success-subtle text-success"
                    : run.result === "fail"
                      ? "bg-destructive-subtle text-destructive"
                      : ""
                )}
              >
                {run.result}
              </Badge>
            </TableCell>
            <TableCell>
              {run.metrics.compliance != null ? `${run.metrics.compliance}%` : "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {format(new Date(run.created_at), "dd MMM yyyy HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
