import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href?: string };
  badge?: string;
}

export function DashboardHeader({
  title,
  description,
  action,
  badge,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-background px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {badge && (
            <Badge className="gap-1.5 bg-success-subtle text-success">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
          >
            <Plus aria-hidden />
            {action.label}
          </Link>
        ) : (
          <Button size="lg" className="shrink-0">
            <Plus aria-hidden />
            {action.label}
          </Button>
        ))}
    </div>
  );
}
