import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricHelpTrigger } from "@/components/help/metric-help-trigger";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  variant?: "default" | "warning" | "success";
  helpId?: string;
}

const iconStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "bg-info-subtle text-info",
  warning: "bg-warning-subtle text-warning",
  success: "bg-success-subtle text-success",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  helpId,
}: StatCardProps) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          {title}
          {helpId && <MetricHelpTrigger helpId={helpId} label={title} />}
        </CardTitle>
        {Icon && (
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              iconStyles[variant]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
