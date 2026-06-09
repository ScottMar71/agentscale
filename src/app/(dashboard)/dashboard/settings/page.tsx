import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ConnectionStatusPanel } from "@/components/settings/connection-status";
import { BillingPanel } from "@/components/settings/billing-panel";
import { TeamPanel } from "@/components/settings/team-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentOrganization, getAuthUser } from "@/lib/auth/session";
import { getOrganizationBilling } from "@/lib/data/organization";
import { listPendingInvites, listTeamMembers } from "@/lib/data/team";
import { isAuthEnabled } from "@/lib/auth/config";
import { isOrgAdmin } from "@/lib/auth/permissions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const authOn = isAuthEnabled();
  const user = authOn ? await getAuthUser() : null;
  const org = authOn ? await getCurrentOrganization() : null;
  const billing = authOn ? await getOrganizationBilling() : null;
  const [members, invites] = authOn
    ? await Promise.all([listTeamMembers(), listPendingInvites()])
    : [[], []];
  const params = await searchParams;
  const checkoutSuccess = params.checkout === "success";

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Organisation, billing, integrations, and team access"
      />
      <div className="max-w-3xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground/60">Name:</span>{" "}
              {org?.name ?? "Acme Corp (demo)"}
            </p>
            {org && (
              <p>
                <span className="text-foreground/60">Your role:</span>{" "}
                <span className="capitalize">{org.role.replace("_", " ")}</span>
              </p>
            )}
            {user && (
              <p>
                <span className="text-foreground/60">Signed in as:</span> {user.email}
              </p>
            )}
          </CardContent>
        </Card>

        {authOn && org && (
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamPanel
                members={members}
                invites={invites}
                isAdmin={isOrgAdmin(org.role)}
              />
            </CardContent>
          </Card>
        )}

        {authOn && (
          <BillingPanel
            billing={billing}
            isAdmin={org?.role === "org_admin"}
            checkoutSuccess={checkoutSuccess}
          />
        )}

        {authOn && user && <SignOutButton />}
        <ConnectionStatusPanel />
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Org admin</span> — billing, team
              invites, certification approvals
            </p>
            <p>
              <span className="font-medium text-foreground">Manager</span> — create and edit
              agents, scenarios, training, incidents
            </p>
            <p>
              <span className="font-medium text-foreground">Viewer</span> — read-only access
              across the workspace
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
