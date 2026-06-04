import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-success-subtle text-success",
  onboarding: "bg-warning-subtle text-warning",
  draft: "bg-muted text-muted-foreground",
  suspended: "bg-destructive-subtle text-destructive",
  archived: "bg-muted text-muted-foreground",
};

const certColors: Record<string, string> = {
  certified: "bg-info-subtle text-info",
  in_progress: "bg-warning-subtle text-warning",
  expired: "bg-destructive-subtle text-destructive",
  none: "bg-muted text-muted-foreground",
  revoked: "bg-destructive-subtle text-destructive",
};

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-warning",
  critical: "text-destructive",
};

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="group/agent block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View ${agent.name}`}
    >
      <Card className="h-full transition-all duration-200 group-hover/agent:-translate-y-0.5 group-hover/agent:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              {agent.name}
            </CardTitle>
            <Badge className={cn("capitalize", statusColors[agent.status])}>
              {agent.status}
            </Badge>
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {agent.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-1">
            {agent.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{agent.department}</span>
            <span className={cn("font-medium capitalize", riskColors[agent.risk_level])}>
              {agent.risk_level} risk
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Badge className={cn("capitalize", certColors[agent.certification_status])}>
              {agent.certification_status.replace("_", " ")}
            </Badge>
            <span className="text-xs font-medium text-primary">
              v{agent.prompt_version}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">Health</span>
            <span className="font-heading font-semibold text-foreground">
              {agent.health_score}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
