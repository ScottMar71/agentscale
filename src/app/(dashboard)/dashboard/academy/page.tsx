import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AcademyGrid } from "@/components/academy/academy-grid";
import { AssignProgrammePanel } from "@/components/academy/assign-programme-panel";
import { listTrainingPrograms, listAgentsForAssignment } from "@/lib/data/training";

export default async function AcademyPage() {
  const [programs, agents] = await Promise.all([
    listTrainingPrograms(),
    listAgentsForAssignment(),
  ]);

  return (
    <>
      <DashboardHeader
        title="Training Academy"
        description="LMS programmes, modules, and knowledge paths for AI agents"
        action={{ label: "Create programme", href: "/dashboard/academy/new" }}
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-8">
        <AssignProgrammePanel programs={programs} agents={agents} />
        <AcademyGrid programs={programs} />
      </div>
    </>
  );
}
