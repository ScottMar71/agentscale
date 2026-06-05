import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LogIncidentForm } from "@/components/incidents/log-incident-form";
import { IncidentList } from "@/components/incidents/incident-list";
import { Card, CardContent } from "@/components/ui/card";
import { listIncidents, listAgentsForIncidentForm } from "@/lib/data/incidents";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";

export default async function IncidentsPage() {
  const [{ incidents, isDemo }, agents, org] = await Promise.all([
    listIncidents(),
    listAgentsForIncidentForm(),
    getCurrentOrganization(),
  ]);
  const canWrite = canWriteOrg(org?.role);

  return (
    <>
      <DashboardHeader
        title="Continuous Improvement"
        description="Incident management, root cause analysis, and remediation workflows"
        badge={isDemo ? "Demo data" : undefined}
        badgeVariant={isDemo ? "demo" : "live"}
      />
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        <Card className="bg-muted">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            When an issue occurs: incident logged → root cause recorded → new training
            scenario created → reassessment triggered → certification reviewed.
          </CardContent>
        </Card>

        {canWrite && !isDemo && <LogIncidentForm agents={agents} />}
        {!canWrite && !isDemo && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              You have viewer access. Contact an organisation admin to log or update incidents.
            </CardContent>
          </Card>
        )}

        <IncidentList incidents={incidents} canWrite={canWrite && !isDemo} />
      </div>
    </>
  );
}
