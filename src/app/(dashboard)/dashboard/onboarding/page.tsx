import { DashboardHeader } from "@/components/layout/dashboard-header";
import { demoOnboarding } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Circle } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <>
      <DashboardHeader
        title="Agent Onboarding"
        description="Track onboarding checklists until agents are production-ready"
      />
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        {demoOnboarding.map((record) => (
          <Card key={record.agent_id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  <Link
                    href={`/dashboard/agents/${record.agent_id}`}
                    className="rounded outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {record.agent_name}
                  </Link>
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {record.progress_percent}% complete
                </p>
              </div>
              <span className="font-heading text-2xl font-semibold text-primary">
                {record.progress_percent}%
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={record.progress_percent} />
              <ul className="grid gap-2 sm:grid-cols-2">
                {record.checklist.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    {item.completed ? (
                      <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
