import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ScenarioForm } from "@/components/scenarios/scenario-form";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function NewScenarioPage() {
  const org = await getCurrentOrganization();
  if (org && !canWriteOrg(org.role)) {
    redirect("/dashboard/scenarios");
  }
  return (
    <>
      <DashboardHeader
        title="New scenario"
        description="Define a test case and pass criteria for AI evaluation"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Link
          href="/dashboard/scenarios"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-2 inline-flex")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to scenarios
        </Link>
        <ScenarioForm mode="create" />
      </div>
    </>
  );
}
