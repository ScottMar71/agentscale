import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProgramDetail } from "@/components/academy/program-detail";
import { getTrainingProgram } from "@/lib/data/training";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getTrainingProgram(id);
  if (!program) notFound();

  return (
    <>
      <DashboardHeader title={program.title} description="Manage modules and content" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Link
          href="/dashboard/academy"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-2 inline-flex")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Academy
        </Link>
        <ProgramDetail program={program} />
      </div>
    </>
  );
}
