import { Calendar, CheckCircle2, ListChecks, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricHelpTrigger } from "@/components/help/metric-help-trigger";
import type { PartnerSuccessMetrics } from "@/types";

export function PartnerSuccessPanel({ metrics }: { metrics: PartnerSuccessMetrics }) {
  const hasData =
    metrics.daysSinceFirstAgent !== null ||
    metrics.daysToFirstCert !== null ||
    metrics.avgOnboardingPct > 0 ||
    metrics.scenarioPassRatePct !== null;

  if (!hasData) {
    return null;
  }

  return (
    <Card className="border-primary/15 bg-info-subtle/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Target className="h-4 w-4 text-primary" aria-hidden />
          Pilot success metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Days since first agent
              <MetricHelpTrigger helpId="pilot.days_since_first_agent" label="Days since first agent" />
            </dt>
            <dd className="mt-1 font-heading text-2xl font-semibold text-foreground">
              {metrics.daysSinceFirstAgent ?? "—"}
            </dd>
            <p className="mt-0.5 text-xs text-muted-foreground">Target: register ≥10 in week 1</p>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Days to first cert
              <MetricHelpTrigger helpId="pilot.days_to_first_cert" label="Days to first cert" />
            </dt>
            <dd className="mt-1 font-heading text-2xl font-semibold text-foreground">
              {metrics.daysToFirstCert ?? "—"}
            </dd>
            <p className="mt-0.5 text-xs text-muted-foreground">Target: &lt; 14 days</p>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              Avg onboarding
              <MetricHelpTrigger helpId="pilot.avg_onboarding" label="Avg onboarding" />
            </dt>
            <dd className="mt-1 font-heading text-2xl font-semibold text-foreground">
              {metrics.avgOnboardingPct}%
            </dd>
            <p className="mt-0.5 text-xs text-muted-foreground">Checklist completion</p>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" aria-hidden />
              Scenario pass rate
              <MetricHelpTrigger helpId="pilot.scenario_pass_rate" label="Scenario pass rate" />
            </dt>
            <dd className="mt-1 font-heading text-2xl font-semibold text-foreground">
              {metrics.scenarioPassRatePct !== null ? `${metrics.scenarioPassRatePct}%` : "—"}
            </dd>
            <p className="mt-0.5 text-xs text-muted-foreground">Last 30 days</p>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
