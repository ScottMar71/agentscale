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
import type { AgentCertification } from "@/types";
import { format } from "date-fns";

export function CertificationsTable({ certs }: { certs: AgentCertification[] }) {
  if (certs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No issued certificates yet. Submit a request once eligibility rules are met.
      </p>
    );
  }

  return (
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
        {certs.map((ac) => (
          <TableRow key={ac.id}>
            <TableCell className="font-medium">{ac.agent_name}</TableCell>
            <TableCell>{ac.certification_name}</TableCell>
            <TableCell>
              <Badge
                className={cn(
                  "capitalize",
                  ac.status === "certified"
                    ? "bg-success-subtle text-success"
                    : ac.status === "in_progress"
                      ? "bg-warning-subtle text-warning"
                      : ac.status === "expired" || ac.status === "revoked"
                        ? "bg-destructive-subtle text-destructive"
                        : ""
                )}
              >
                {ac.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {ac.earned_at ? format(new Date(ac.earned_at), "dd MMM yyyy") : "—"}
            </TableCell>
            <TableCell>
              {ac.expires_at ? format(new Date(ac.expires_at), "dd MMM yyyy") : "—"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {ac.certificate_number ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
