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
import { APP_NAME } from "@/lib/constants";

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

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-[#0B1426] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold">
            AS
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
            <p className="text-[10px] text-slate-400">AI Workforce Platform</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[#2563EB] text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
