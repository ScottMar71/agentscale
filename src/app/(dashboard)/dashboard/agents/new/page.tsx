import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AgentForm } from "@/components/agents/agent-form";

export default function NewAgentPage() {
  return (
    <>
      <DashboardHeader
        title="Register agent"
        description="Add a new AI agent to your organisation registry"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <AgentForm mode="create" />
      </div>
    </>
  );
}
