import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  onboarding: "bg-amber-50 text-amber-700",
  draft: "bg-slate-100 text-slate-600",
  suspended: "bg-red-50 text-red-700",
  archived: "bg-slate-100 text-slate-500",
};

const certColors: Record<string, string> = {
  certified: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  expired: "bg-red-50 text-red-700",
  none: "bg-slate-100 text-slate-600",
  revoked: "bg-red-50 text-red-700",
};

const riskColors: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/dashboard/agents/${agent.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold text-[#0B1426]">
              {agent.name}
            </CardTitle>
            <Badge className={cn("text-xs", statusColors[agent.status])}>
              {agent.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
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
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{agent.department}</span>
            <span className={cn("font-medium", riskColors[agent.risk_level])}>
              {agent.risk_level} risk
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Badge className={cn("text-xs", certColors[agent.certification_status])}>
              {agent.certification_status.replace("_", " ")}
            </Badge>
            <span className="text-xs font-medium text-[#2563EB]">
              v{agent.prompt_version}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-500">Health</span>
            <span className="font-semibold text-[#0B1426]">{agent.health_score}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
