import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getServiceConnections,
  isDemoMode,
  type ConnectionStatus,
} from "@/lib/connections";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import Link from "next/link";

const statusStyles: Record<
  ConnectionStatus,
  { badge: string; icon: typeof CheckCircle2 }
> = {
  connected: {
    badge: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  partial: {
    badge: "bg-amber-50 text-amber-700",
    icon: AlertCircle,
  },
  not_configured: {
    badge: "bg-slate-100 text-slate-600",
    icon: Circle,
  },
};

export function ConnectionStatusPanel() {
  const connections = getServiceConnections();
  const demo = isDemoMode();

  return (
    <div className="space-y-4">
      {demo && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Demo mode</strong> — dashboard uses sample data until Supabase keys
          are set. Run{" "}
          <code className="rounded bg-amber-100 px-1">vercel env pull .env.local</code>{" "}
          after connecting integrations.
        </div>
      )}
      <Card className="border-slate-200">
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
                className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <Icon
                    className={`h-5 w-5 shrink-0 mt-0.5 ${
                      svc.status === "connected"
                        ? "text-emerald-600"
                        : svc.status === "partial"
                          ? "text-amber-600"
                          : "text-slate-400"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-[#0B1426]">{svc.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{svc.detail}</p>
                    {svc.docsUrl && (
                      <Link
                        href={svc.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2563EB] hover:underline mt-1 inline-block"
                      >
                        Open dashboard →
                      </Link>
                    )}
                  </div>
                </div>
                <Badge className={style.badge}>{svc.status.replace("_", " ")}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
