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
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {demoOnboarding.map((record) => (
          <Card key={record.agent_id} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  <Link
                    href={`/dashboard/agents/${record.agent_id}`}
                    className="hover:text-[#2563EB]"
                  >
                    {record.agent_name}
                  </Link>
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {record.progress_percent}% complete
                </p>
              </div>
              <span className="text-2xl font-semibold text-[#2563EB]">
                {record.progress_percent}%
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={record.progress_percent} />
              <ul className="grid gap-2 sm:grid-cols-2">
                {record.checklist.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    {item.completed ? (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300 shrink-0" />
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
