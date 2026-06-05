import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PerformanceSnapshot } from "@/types";

interface PerformanceScorecardsProps {
  snapshots: PerformanceSnapshot[];
}

export function PerformanceScorecards({ snapshots }: PerformanceScorecardsProps) {
  if (snapshots.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No performance snapshots yet. Import metrics manually or send them via the performance webhook.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <CardHeader>
        <CardTitle>Agent scorecards</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Escalation</TableHead>
              <TableHead>Hallucination</TableHead>
              <TableHead>Cost/task</TableHead>
              <TableHead>Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/agents/${row.agent_id}`} className="hover:underline">
                    {row.agent_name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex w-24 items-center gap-2">
                    <Progress value={row.health_score ?? 0} className="h-2" />
                    <span className="text-xs">{row.health_score ?? "—"}</span>
                  </div>
                </TableCell>
                <TableCell>{row.accuracy != null ? `${row.accuracy}%` : "—"}</TableCell>
                <TableCell>{row.success_rate != null ? `${row.success_rate}%` : "—"}</TableCell>
                <TableCell>{row.escalation_rate != null ? `${row.escalation_rate}%` : "—"}</TableCell>
                <TableCell>{row.hallucination_rate != null ? `${row.hallucination_rate}%` : "—"}</TableCell>
                <TableCell>{row.cost_per_task != null ? `£${row.cost_per_task.toFixed(3)}` : "—"}</TableCell>
                <TableCell>
                  {row.avg_response_time_ms != null ? `${row.avg_response_time_ms}ms` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
