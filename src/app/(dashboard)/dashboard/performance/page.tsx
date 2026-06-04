import { DashboardHeader } from "@/components/layout/dashboard-header";
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

const performanceData = [
  { name: "Sales SDR Agent", health: 91, accuracy: 94, successRate: 89, escalation: 3, hallucination: 5, costPerTask: "0.042", avgResponseMs: 1100 },
  { name: "Customer Support Agent", health: 88, accuracy: 92, successRate: 87, escalation: 6, hallucination: 7, costPerTask: "0.038", avgResponseMs: 980 },
  { name: "Code Review Agent", health: 94, accuracy: 96, successRate: 93, escalation: 1, hallucination: 3, costPerTask: "0.055", avgResponseMs: 2200 },
  { name: "Finance Ops Agent", health: 71, accuracy: 78, successRate: 72, escalation: 12, hallucination: 18, costPerTask: "0.061", avgResponseMs: 1850 },
];

export default function PerformancePage() {
  return (
    <>
      <DashboardHeader
        title="Performance Management"
        description="AI agent scorecards, health scores, and operational KPIs"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Avg accuracy", value: "91%" },
            { label: "Success rate", value: "87%" },
            { label: "Avg cost/task", value: "£0.04" },
            { label: "Avg response", value: "1.2s" },
          ].map((m) => (
            <Card key={m.label} className="transition-shadow duration-200 hover:shadow-md">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-heading text-2xl font-semibold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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
                {performanceData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-24">
                        <Progress value={row.health} className="h-2" />
                        <span className="text-xs">{row.health}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.accuracy}%</TableCell>
                    <TableCell>{row.successRate}%</TableCell>
                    <TableCell>{row.escalation}%</TableCell>
                    <TableCell>{row.hallucination}%</TableCell>
                    <TableCell>£{row.costPerTask}</TableCell>
                    <TableCell>{row.avgResponseMs}ms</TableCell>
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
