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
      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              <span className="text-slate-500">Name:</span> Acme Corp (Demo)
            </p>
            <p>
              <span className="text-slate-500">Plan:</span>{" "}
              <Badge>{PLANS.growth.name}</Badge> — up to {PLANS.growth.agents} agents
            </p>
          </CardContent>
        </Card>
        <ConnectionStatusPanel />
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Super Admin · Organisation Admin · Manager · Viewer
          </CardContent>
        </Card>
      </div>
    </>
  );
}
