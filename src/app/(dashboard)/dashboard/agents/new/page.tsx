import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AgentForm } from "@/components/agents/agent-form";
import { getOrganizationBilling } from "@/lib/data/organization";
import { formatAgentLimit } from "@/lib/billing/plans";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewAgentPage() {
  const billing = await getOrganizationBilling();

  return (
    <>
      <DashboardHeader
        title="Register agent"
        description="Add a new AI agent to your organisation registry"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {billing && !billing.can_add_agent && (
          <Card className="mb-6 border-destructive/30 bg-destructive-subtle/30">
            <CardContent className="py-4 text-sm">
              <p className="font-medium text-foreground">
                Agent limit reached ({billing.agent_count} /{" "}
                {formatAgentLimit(billing.agent_limit)})
              </p>
              <p className="mt-1 text-muted-foreground">
                Upgrade your plan in{" "}
                <Link href="/dashboard/settings" className="text-primary underline-offset-2 hover:underline">
                  Settings
                </Link>{" "}
                to register more agents.
              </p>
            </CardContent>
          </Card>
        )}
        <AgentForm mode="create" />
      </div>
    </>
  );
}
