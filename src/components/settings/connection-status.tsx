import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getServiceConnections,
  isDemoMode,
  type ConnectionStatus,
} from "@/lib/connections";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const statusStyles: Record<
  ConnectionStatus,
  { badge: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  connected: {
    badge: "bg-success-subtle text-success",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  partial: {
    badge: "bg-warning-subtle text-warning",
    icon: AlertCircle,
    iconColor: "text-warning",
  },
  not_configured: {
    badge: "bg-muted text-muted-foreground",
    icon: Circle,
    iconColor: "text-muted-foreground/60",
  },
};

export function ConnectionStatusPanel() {
  const connections = getServiceConnections();
  const demo = isDemoMode();

  return (
    <div className="space-y-4">
      {demo && (
        <div className="rounded-lg border border-warning/30 bg-warning-subtle px-4 py-3 text-sm text-warning">
          <strong>Demo mode</strong> — the dashboard uses sample data until Supabase keys
          are set. Run{" "}
          <code className="rounded bg-warning/15 px-1 font-mono">vercel env pull .env.local</code>{" "}
          after connecting integrations.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Connected services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections.map((svc) => {
            const style = statusStyles[svc.status];
            const Icon = style.icon;
            return (
              <div
                key={svc.id}
                className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconColor)} aria-hidden />
                  <div>
                    <p className="font-medium text-foreground">{svc.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{svc.detail}</p>
                    {svc.docsUrl && (
                      <Link
                        href={svc.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-primary hover:underline"
                      >
                        Open dashboard →
                      </Link>
                    )}
                  </div>
                </div>
                <Badge className={cn("capitalize", style.badge)}>{svc.status.replace("_", " ")}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
