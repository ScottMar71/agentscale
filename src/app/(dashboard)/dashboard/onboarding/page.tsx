import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OnboardingBoard } from "@/components/onboarding/onboarding-board";
import { listOnboardingRecords } from "@/lib/data/onboarding";

export default async function OnboardingPage() {
  const records = await listOnboardingRecords();

  return (
    <>
      <DashboardHeader
        title="Agent Onboarding"
        description="Track onboarding checklists until agents are production-ready"
        action={{ label: "Register agent", href: "/dashboard/agents/new" }}
      />
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        <OnboardingBoard records={records} />
      </div>
    </>
  );
}
