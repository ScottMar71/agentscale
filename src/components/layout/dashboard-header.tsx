import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1426]">
            {title}
          </h1>
          {badge && (
            <Badge variant="secondary" className="bg-blue-50 text-[#2563EB]">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && (
        <Button className="bg-[#2563EB] hover:bg-[#1d4ed8]">
          {action.label}
        </Button>
      )}
    </div>
  );
}
