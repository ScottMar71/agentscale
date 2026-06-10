"use client";

import type { ReactNode } from "react";
import type { OrgRole } from "@/types";
import { HelpProvider } from "@/components/help/help-provider";
import { PlatformCoachSheet } from "@/components/help/platform-coach-sheet";

export function DashboardHelpShell({
  children,
  role = null,
}: {
  children: ReactNode;
  role?: OrgRole | null;
}) {
  return (
    <HelpProvider role={role}>
      {children}
      <PlatformCoachSheet />
    </HelpProvider>
  );
}
