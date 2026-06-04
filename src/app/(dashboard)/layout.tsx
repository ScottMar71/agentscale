import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { isAuthEnabled } from "@/lib/auth/config";
import {
  getAuthUser,
  getCurrentOrganizationId,
  getUserOrganizations,
} from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organizations: Awaited<ReturnType<typeof getUserOrganizations>> = [];
  let currentOrgId: string | null = null;

  if (isAuthEnabled()) {
    const user = await getAuthUser();
    if (!user) {
      redirect("/login?next=/dashboard");
    }

    organizations = await getUserOrganizations();
    if (organizations.length === 0) {
      redirect("/setup");
    }

    currentOrgId = await getCurrentOrganizationId(organizations);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <DashboardSidebar
        organizations={organizations}
        currentOrgId={currentOrgId ?? undefined}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardMobileNav
          organizations={organizations}
          currentOrgId={currentOrgId ?? undefined}
        />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
