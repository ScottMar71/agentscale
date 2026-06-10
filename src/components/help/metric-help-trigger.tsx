"use client";

import { CircleHelp } from "lucide-react";
import { getHelpTopic } from "@/lib/help/topics";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpTopicContent } from "@/components/help/help-topic-content";
import { useHelp } from "@/components/help/help-provider";
import { cn } from "@/lib/utils";

export function MetricHelpTrigger({
  helpId,
  label,
  className,
  side = "top",
}: {
  helpId: string;
  label?: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const topic = getHelpTopic(helpId);
  const { role, openCoach } = useHelp();

  if (!topic) return null;

  const ariaLabel = label ? `Help: ${label}` : `Help: ${topic.title}`;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              "size-5 shrink-0 text-muted-foreground/60 opacity-70 hover:text-muted-foreground hover:opacity-100",
              className
            )}
            aria-label={ariaLabel}
          />
        }
      >
        <CircleHelp className="size-3.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent side={side} align="start" className="w-80 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{topic.title}</p>
          </div>
          <HelpTopicContent topic={topic} role={role} compact />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => openCoach(helpId)}
          >
            Open in Coach
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
