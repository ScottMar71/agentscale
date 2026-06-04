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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import type { UserOrganization } from "@/lib/auth/session";

const iconMap = {
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
} as const;

const links = [
  { href: "/dashboard", label: "Executive", icon: "LayoutDashboard" as const },
  { href: "/dashboard/agents", label: "Agent Registry", icon: "Bot" as const },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: "ClipboardCheck" as const },
  { href: "/dashboard/academy", label: "Training Academy", icon: "GraduationCap" as const },
  { href: "/dashboard/scenarios", label: "Scenario Testing", icon: "FlaskConical" as const },
  { href: "/dashboard/certifications", label: "Certifications", icon: "Award" as const },
  { href: "/dashboard/performance", label: "Performance", icon: "BarChart3" as const },
  { href: "/dashboard/governance", label: "Governance", icon: "Shield" as const },
  { href: "/dashboard/versions", label: "Version Control", icon: "GitBranch" as const },
  { href: "/dashboard/incidents", label: "Improvement", icon: "RefreshCw" as const },
];

/** Shared nav body used by both the desktop sidebar and the mobile sheet. */
export function SidebarNav({
  onNavigate,
  organizations = [],
  currentOrgId,
}: {
  onNavigate?: () => void;
  organizations?: UserOrganization[];
  currentOrgId?: string;
}) {
  const pathname = usePathname();

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
          </div>
        )}
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
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
      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-foreground/70 outline-none transition-colors duration-200 hover:bg-white/5 hover:text-brand-foreground focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Settings
        </Link>
      </div>
    </nav>
  );
}

export function DashboardSidebar({
  organizations = [],
  currentOrgId,
}: {
  organizations?: UserOrganization[];
  currentOrgId?: string;
}) {
  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-border/0 lg:block">
      <SidebarNav
        organizations={organizations}
        currentOrgId={currentOrgId}
      />
    </aside>
  );
}
