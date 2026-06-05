import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { parsePassCriteria } from "@/lib/schemas/scenario";
import type { TestScenario } from "@/types";

export function ScenarioGrid({
  scenarios,
  canWrite = true,
}: {
  scenarios: TestScenario[];
  canWrite?: boolean;
}) {
  if (scenarios.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No test scenarios yet"
        description="Define scenarios to evaluate agent responses with AI scoring."
        action={
          canWrite ? (
            <Link href="/dashboard/scenarios/new" className={buttonVariants({ size: "lg" })}>
              New scenario
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((s) => {
        const criteria = parsePassCriteria(s.pass_criteria as Record<string, unknown>);
        return (
          <Link key={s.id} href={`/dashboard/scenarios/${s.id}`}>
            <Card className="h-full transition-shadow duration-200 hover:shadow-md">
              <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-lg bg-info-subtle text-primary">
                  <FlaskConical className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle className="mt-2 text-base">{s.name}</CardTitle>
                {s.is_published === false && (
                  <Badge variant="outline" className="w-fit">
                    Draft
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="line-clamp-3 text-muted-foreground">{s.prompt}</p>
                <p className="text-xs text-muted-foreground">
                  {s.run_count ?? 0} runs · Min score {criteria.min_score ?? 80}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
