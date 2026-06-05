import { Suspense } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { VersionTimeline } from "@/components/versions/version-timeline";
import { listAgents } from "@/lib/data/agents";
import { listAgentVersions } from "@/lib/data/versions";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";

export default async function VersionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>;
}) {
  const params = await searchParams;
  const [agents, org] = await Promise.all([listAgents(), getCurrentOrganization()]);
  const selectedAgentId = params.agent ?? agents[0]?.id ?? null;
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const { versions, isDemo } = selectedAgentId
    ? await listAgentVersions(selectedAgentId)
    : { versions: [], isDemo: false };

  return (
    <>
      <DashboardHeader
        title="Agent Version Control"
        description="Prompt, model, and knowledge base version timeline with rollback"
        badge={isDemo ? "Demo data" : undefined}
        badgeVariant={isDemo ? "demo" : "live"}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Suspense fallback={null}>
          <VersionTimeline
            agents={agents.map((a) => ({ id: a.id, name: a.name }))}
            selectedAgentId={selectedAgentId}
            selectedAgentName={selectedAgent?.name ?? "Agent"}
            versions={versions}
            canWrite={canWriteOrg(org?.role) && !isDemo}
          />
        </Suspense>
      </div>
    </>
  );
}
