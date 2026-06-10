"use client";

import Link from "next/link";
import type { HelpTopic } from "@/lib/help/types";
import type { OrgRole } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function filterSteps(
  steps: HelpTopic["improveSteps"],
  role: OrgRole | null | undefined
) {
  if (!steps) return [];
  return steps.filter((step) => {
    if (!step.roles || step.roles.length === 0) return true;
    if (!role) return true;
    return step.roles.includes(role);
  });
}

export function HelpTopicContent({
  topic,
  role,
  compact = false,
  onOpenRelated,
}: {
  topic: HelpTopic;
  role?: OrgRole | null;
  compact?: boolean;
  onOpenRelated?: (topicId: string) => void;
}) {
  const steps = filterSteps(topic.improveSteps, role);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <p className="text-sm text-muted-foreground">{topic.summary}</p>

      {!compact && topic.definition && (
        <p className="text-sm text-foreground">{topic.definition}</p>
      )}

      {topic.formula && (
        <div>
          <p className="text-xs font-medium text-foreground">Formula</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{topic.formula}</p>
        </div>
      )}

      {topic.dataSource && (
        <p className="text-xs text-muted-foreground">{topic.dataSource}</p>
      )}

      {topic.targets && (
        <div className="rounded-md bg-muted/60 px-2.5 py-2">
          <p className="text-xs font-medium text-foreground">Target</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{topic.targets}</p>
        </div>
      )}

      {!compact && topic.appearsOn && topic.appearsOn.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Appears on: {topic.appearsOn.join(" · ")}
        </p>
      )}

      {steps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Suggested actions</p>
          <ul className="space-y-1">
            {steps.map((step) => (
              <li key={`${step.href}-${step.label}`}>
                <Link
                  href={step.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-7 w-full justify-start text-xs"
                  )}
                >
                  {step.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && topic.relatedIds && topic.relatedIds.length > 0 && onOpenRelated && (
        <div className="flex flex-wrap gap-1.5">
          {topic.relatedIds.map((relatedId) => (
            <button
              key={relatedId}
              type="button"
              onClick={() => onOpenRelated(relatedId)}
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Related: {relatedId.replace(/^(metric|pilot)\./, "").replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
