import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AcademyGrid } from "@/components/academy/academy-grid";
import { AssignProgrammePanel } from "@/components/academy/assign-programme-panel";
import { listTrainingPrograms, listAgentsForAssignment } from "@/lib/data/training";
import { getCurrentOrganization } from "@/lib/auth/session";
import { canWriteOrg } from "@/lib/auth/permissions";

export default async function AcademyPage() {
  const [programs, agents, org] = await Promise.all([
    listTrainingPrograms(),
    listAgentsForAssignment(),
    getCurrentOrganization(),
  ]);
  const canWrite = canWriteOrg(org?.role);

  return (
    <>
      <DashboardHeader
        title="Training Academy"
        description="LMS programmes, modules, and knowledge paths for AI agents"
        action={canWrite ? { label: "Create programme", href: "/dashboard/academy/new" } : undefined}
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        {canWrite && <AssignProgrammePanel programs={programs} agents={agents} />}
        <AcademyGrid programs={programs} canWrite={canWrite} />
      </div>
    </>
  );
}
