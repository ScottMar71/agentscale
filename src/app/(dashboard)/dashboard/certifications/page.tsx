import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ApproverInbox } from "@/components/certifications/approver-inbox";
import { CertificationsTable } from "@/components/certifications/certifications-table";
import { RequestCertificationForm } from "@/components/certifications/request-certification-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentOrganization } from "@/lib/auth/session";
import { listAgents } from "@/lib/data/agents";
import {
  listCertificationDefinitions,
  listAgentCertifications,
  listPendingApprovals,
} from "@/lib/data/certifications";

export default async function CertificationsPage() {
  const [definitions, certs, pending, agents, org] = await Promise.all([
    listCertificationDefinitions(),
    listAgentCertifications(),
    listPendingApprovals(),
    listAgents(),
    getCurrentOrganization(),
  ]);

  const isAdmin = org?.role === "org_admin";
  const canRequest = org?.role !== "viewer";

  return (
    <>
      <DashboardHeader
        title="Certification Engine"
        description="Digital certificates, expiry tracking, and approval workflows"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <ApproverInbox pending={pending} isAdmin={isAdmin ?? false} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {definitions.map((c) => (
            <Card key={c.id} className="transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>Valid {c.validity_days} days</p>
                <p>
                  Rules: {c.rules.min_scenario_passes ?? 1} scenario pass
                  {c.rules.require_onboarding_complete ? " · onboarding complete" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <RequestCertificationForm
          agents={agents}
          definitions={definitions}
          canRequest={canRequest ?? false}
        />

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Certificate registry</CardTitle>
          </CardHeader>
          <CardContent>
            <CertificationsTable certs={certs} />
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <strong className="text-foreground">Certification rules:</strong> Complete training →
            Pass scenario tests → Request certification → Org admin approves → Digital
            certificate issued with expiry tracking.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
