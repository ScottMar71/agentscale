"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataModeBannerProps {
  authEnabled: boolean;
  organizationName?: string | null;
}

export function DataModeBanner({ authEnabled, organizationName }: DataModeBannerProps) {
  const pathname = usePathname();
  const onDemoRoute = pathname === "/dashboard/demo";

  if (onDemoRoute) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-b border-warning/30 bg-warning-subtle px-4 py-2 text-center text-sm text-warning"
      >
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          <strong className="font-medium">Demo dashboard</strong> — sample metrics and agents
          only. Changes are not saved to your organisation.
        </span>
        {authEnabled && (
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-warning/40 bg-background text-warning hover:bg-background/80"
            )}
          >
            Switch to live dashboard
          </Link>
        )}
      </div>
    );
  }

  if (!authEnabled) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-b border-warning/30 bg-warning-subtle px-4 py-2 text-center text-sm text-warning"
      >
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          <strong className="font-medium">Demo mode</strong> — Supabase is not configured.
          Data is sample only and writes are disabled.
        </span>
        <Link
          href="/dashboard/settings"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-warning/40 bg-background text-warning hover:bg-background/80"
          )}
        >
          Connection settings
        </Link>
      </div>
    );
  }

  return null;
}

interface DataModeIndicatorProps {
  authEnabled: boolean;
  organizationName?: string | null;
}

/** Compact live-org indicator shown under the org switcher in the sidebar. */
export function DataModeIndicator({ authEnabled, organizationName }: DataModeIndicatorProps) {
  const pathname = usePathname();
  const onDemoRoute = pathname === "/dashboard/demo";

  if (!authEnabled || onDemoRoute) return null;

  return (
    <div
      role="status"
      className="mt-2 flex items-center gap-1.5 px-1 text-xs text-brand-foreground/60"
      title={organizationName ? `Live data for ${organizationName}` : "Live organisation data"}
    >
      <span className="size-1.5 rounded-full bg-success" aria-hidden />
      <span>Live{organizationName ? ` · ${organizationName}` : ""}</span>
    </div>
  );
}
