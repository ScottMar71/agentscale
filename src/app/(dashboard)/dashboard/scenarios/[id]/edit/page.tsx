import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ScenarioForm } from "@/components/scenarios/scenario-form";
import { getTestScenario } from "@/lib/data/scenarios";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await getTestScenario(id);
  if (!scenario) notFound();

  return (
    <>
      <DashboardHeader title={`Edit: ${scenario.name}`} description="Update scenario definition" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Link
          href={`/dashboard/scenarios/${id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-2 inline-flex")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to scenario
        </Link>
        <ScenarioForm mode="edit" scenario={scenario} />
      </div>
    </>
  );
}
