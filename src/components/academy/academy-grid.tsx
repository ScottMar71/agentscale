import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { TrainingProgram } from "@/types";

export function AcademyGrid({
  programs,
  canWrite = true,
}: {
  programs: TrainingProgram[];
  canWrite?: boolean;
}) {
  if (programs.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No training programmes yet"
        description="Create your first programme to define modules and assign them to agents."
        action={
          canWrite ? (
            <Link href="/dashboard/academy/new" className={buttonVariants({ size: "lg" })}>
              Create programme
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => (
        <Link key={program.id} href={`/dashboard/academy/${program.id}`}>
          <Card className="h-full transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-info-subtle text-primary">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </span>
                {program.is_published && (
                  <Badge className="bg-success-subtle text-success">Published</Badge>
                )}
              </div>
              <CardTitle className="mt-2 text-lg">{program.title}</CardTitle>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {program.description}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {program.module_count} modules
                {program.certification_type
                  ? ` · Cert: ${program.certification_type}`
                  : ""}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
