import { Suspense } from "react";
import { listAgents, listAgentDepartments } from "@/lib/data/agents";
import { AgentRegistry } from "@/components/agents/agent-registry";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    department?: string;
  }>;
}

export default async function AgentRegistryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    q: params.q ?? "",
    status: params.status ?? "all",
    department: params.department ?? "all",
  };

  const [agents, departments] = await Promise.all([
    listAgents({
      search: filters.q,
      status: filters.status,
      department: filters.department,
    }),
    listAgentDepartments(),
  ]);

  return (
    <Suspense fallback={null}>
      <AgentRegistry agents={agents} departments={departments} filters={filters} />
    </Suspense>
  );
}
