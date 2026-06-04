import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ConnectionStatusPanel } from "@/components/settings/connection-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
export default function SettingsPage() {
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
              <span className="text-foreground/60">Name:</span> Acme Corp
            </p>
            <p>
              <span className="text-foreground/60">Plan:</span>{" "}
              <Badge>{PLANS.growth.name}</Badge> — up to {PLANS.growth.agents} agents
            </p>
          </CardContent>
        </Card>
        <ConnectionStatusPanel />
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Super Admin · Organisation Admin · Manager · Viewer
          </CardContent>
        </Card>
      </div>
    </>
  );
}
