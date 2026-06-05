"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, Circle, Loader2 } from "lucide-react";
import { updateOnboardingChecklistItem } from "@/app/actions/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { OnboardingRecord } from "@/types";

export function OnboardingBoard({
  records,
  canWrite = true,
}: {
  records: OnboardingRecord[];
  canWrite?: boolean;
}) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No agents in onboarding"
        description="Register an agent with status Draft or Onboarding to track readiness here."
        action={
          canWrite ? (
            <Link href="/dashboard/agents/new" className={buttonVariants({ size: "lg" })}>
              Register agent
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {records.map((record) => (
        <OnboardingCard key={record.agent_id} record={record} canWrite={canWrite} />
      ))}
    </div>
  );
}

function OnboardingCard({
  record,
  canWrite,
}: {
  record: OnboardingRecord;
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle(key: string, completed: boolean) {
    startTransition(async () => {
      await updateOnboardingChecklistItem(record.agent_id, key, completed);
    });
  }

  return (
    <Card className={pending ? "opacity-80" : undefined}>
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
            {record.completed_at && " · Ready for production"}
          </p>
        </div>
        <span className="flex items-center gap-2 font-heading text-2xl font-semibold text-primary">
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {record.progress_percent}%
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={record.progress_percent} />
        <ul className="grid gap-2 sm:grid-cols-2">
          {record.checklist.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                disabled={pending || !canWrite}
                onClick={() => toggle(item.key, !item.completed)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
              >
                {item.completed ? (
                  <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden />
                )}
                <span className={item.completed ? "text-muted-foreground line-through" : ""}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
