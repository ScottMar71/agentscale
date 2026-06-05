import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OnboardingBoard } from "@/components/onboarding/onboarding-board";
import { listOnboardingRecords } from "@/lib/data/onboarding";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";

export default async function OnboardingPage() {
  const [records, org] = await Promise.all([
    listOnboardingRecords(),
    getCurrentOrganization(),
  ]);
  const canWrite = canWriteOrg(org?.role);

  return (
    <>
      <DashboardHeader
        title="Agent Onboarding"
        description="Track onboarding checklists until agents are production-ready"
        action={canWrite ? { label: "Register agent", href: "/dashboard/agents/new" } : undefined}
      />
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        <OnboardingBoard records={records} canWrite={canWrite} />
      </div>
    </>
  );
}
