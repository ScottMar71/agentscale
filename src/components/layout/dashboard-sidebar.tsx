"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Bot,
  ClipboardCheck,
  FlaskConical,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  RefreshCw,
  Shield,
  Settings,
  Sparkles,
  ShieldEllipsis,
  CircleHelp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavIconName } from "@/lib/constants";
import { Logo } from "@/components/brand/logo";
import { SignOutNavItem } from "@/components/auth/sign-out-button";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { DataModeIndicator } from "@/components/layout/data-mode-banner";
import { useHelp } from "@/components/help/help-provider";
import type { UserOrganization } from "@/lib/auth/session";

const iconMap: Record<NavIconName, typeof LayoutDashboard> = {
  LayoutDashboard,
  Bot,
  ClipboardCheck,
  GraduationCap,
  FlaskConical,
  Award,
  BarChart3,
  Shield,
  GitBranch,
  RefreshCw,
};

/** Shared nav body used by both the desktop sidebar and the mobile sheet. */
export function SidebarNav({
  onNavigate,
  organizations = [],
  currentOrgId,
  authEnabled = false,
  organizationName,
  isSuperAdmin = false,
}: {
  onNavigate?: () => void;
  organizations?: UserOrganization[];
  currentOrgId?: string;
  authEnabled?: boolean;
  organizationName?: string | null;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const { openCoach } = useHelp();

  return (
    <nav
      aria-label="Primary"
      className="flex h-full flex-col bg-brand text-brand-foreground"
    >
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <Logo
            subtitle="AI Workforce Platform"
            wordmarkClassName="text-brand-foreground"
          />
        </Link>
        {organizations.length > 0 && currentOrgId && (
          <div className="mt-3 px-1">
            <OrgSwitcher organizations={organizations} currentOrgId={currentOrgId} />
            <DataModeIndicator
              authEnabled={authEnabled}
              organizationName={organizationName}
            />
          </div>
        )}
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((link) => {
          const Icon = iconMap[link.icon];
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-brand-accent",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-brand-foreground/70 hover:bg-white/5 hover:text-brand-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-0.5 border-t border-white/10 px-3 py-4">
        {isSuperAdmin && (
          <Link
            href="/dashboard/admin"
            onClick={onNavigate}
            aria-current={pathname === "/dashboard/admin" ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-brand-accent",
              pathname === "/dashboard/admin"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-brand-foreground/70 hover:bg-white/5 hover:text-brand-foreground"
            )}
          >
            <ShieldEllipsis className="h-4 w-4" aria-hidden />
            Platform Admin
          </Link>
        )}
        <Link
          href="/dashboard/demo"
          onClick={onNavigate}
          aria-current={pathname === "/dashboard/demo" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-brand-accent",
            pathname === "/dashboard/demo"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-brand-foreground/70 hover:bg-white/5 hover:text-brand-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Demo dashboard
        </Link>
        <button
          type="button"
          onClick={() => {
            openCoach();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-foreground/70 outline-none transition-colors duration-200 hover:bg-white/5 hover:text-brand-foreground focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <CircleHelp className="h-4 w-4" aria-hidden />
          Platform Coach
        </button>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-foreground/70 outline-none transition-colors duration-200 hover:bg-white/5 hover:text-brand-foreground focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Settings
        </Link>
        {authEnabled && <SignOutNavItem onNavigate={onNavigate} />}
      </div>
    </nav>
  );
}

export function DashboardSidebar({
  organizations = [],
  currentOrgId,
  authEnabled = false,
  organizationName,
  isSuperAdmin = false,
}: {
  organizations?: UserOrganization[];
  currentOrgId?: string;
  authEnabled?: boolean;
  organizationName?: string | null;
  isSuperAdmin?: boolean;
}) {
  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-border/0 lg:block">
      <SidebarNav
        organizations={organizations}
        currentOrgId={currentOrgId}
        authEnabled={authEnabled}
        organizationName={organizationName}
        isSuperAdmin={isSuperAdmin}
      />
    </aside>
  );
}
