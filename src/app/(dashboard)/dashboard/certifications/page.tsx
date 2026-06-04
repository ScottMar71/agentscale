import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoCertifications, demoAgentCerts } from "@/lib/demo-data";
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
import { format } from "date-fns";

export default function CertificationsPage() {
  return (
    <>
      <DashboardHeader
        title="Certification Engine"
        description="Digital certificates, expiry tracking, and approval workflows"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {demoCertifications.map((c) => (
            <Card key={c.id} className="transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Valid {c.validity_days} days
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Issued certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Earned</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Certificate #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoAgentCerts.map((ac) => (
                  <TableRow key={ac.id}>
                    <TableCell className="font-medium">{ac.agent_name}</TableCell>
                    <TableCell>{ac.certification_name}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "capitalize",
                          ac.status === "certified"
                            ? "bg-info-subtle text-info"
                            : "bg-destructive-subtle text-destructive"
                        )}
                      >
                        {ac.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ac.earned_at
                        ? format(new Date(ac.earned_at), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {ac.expires_at
                        ? format(new Date(ac.expires_at), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ac.certificate_number}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <strong className="text-foreground">Certification rules:</strong> Complete training → Pass assessments
            → Pass scenario tests → Human approval → Digital certificate issued.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
