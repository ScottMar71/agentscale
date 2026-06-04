import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoCertifications, demoAgentCerts } from "@/lib/demo-data";
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
import { format } from "date-fns";

export default function CertificationsPage() {
  return (
    <>
      <DashboardHeader
        title="Certification Engine"
        description="Digital certificates, expiry tracking, and approval workflows"
      />
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {demoCertifications.map((c) => (
            <Card key={c.id} className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Valid {c.validity_days} days
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200">
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
                        className={
                          ac.status === "certified"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                        }
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

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-6 text-sm text-slate-600">
            <strong>Certification rules:</strong> Complete training → Pass assessments
            → Pass scenario tests → Human approval → Digital certificate issued.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
