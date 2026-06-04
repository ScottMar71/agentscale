import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AgentForm } from "@/components/agents/agent-form";
import { getAgentById } from "@/lib/data/agents";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) notFound();

  return (
    <>
      <DashboardHeader
        title={`Edit ${agent.name}`}
        description="Update registry metadata and deployment settings"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Link
          href={`/dashboard/agents/${id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2 inline-flex")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to agent
        </Link>
        <AgentForm mode="edit" agent={agent} />
      </div>
    </>
  );
}
