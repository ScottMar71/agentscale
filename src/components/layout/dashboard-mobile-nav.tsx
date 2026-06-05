"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/dashboard-sidebar";
import type { UserOrganization } from "@/lib/auth/session";

export function DashboardMobileNav({
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
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-brand px-4 text-brand-foreground lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="text-brand-foreground hover:bg-white/10 hover:text-brand-foreground"
            />
          }
        >
          <Menu aria-hidden />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 max-w-[80vw] p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav
            onNavigate={() => setOpen(false)}
            organizations={organizations}
            currentOrgId={currentOrgId}
            authEnabled={authEnabled}
            organizationName={organizationName}
            isSuperAdmin={isSuperAdmin}
          />
        </SheetContent>
      </Sheet>
      <Logo wordmarkClassName="text-brand-foreground" />
    </header>
  );
}
