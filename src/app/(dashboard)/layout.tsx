import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { isAuthEnabled } from "@/lib/auth/config";
import {
  getAuthUser,
  getAccessibleOrganizations,
  getCurrentOrganizationId,
  getIsSuperAdmin,
} from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authEnabled = isAuthEnabled();
  let organizations: Awaited<ReturnType<typeof getAccessibleOrganizations>> = [];
  let currentOrgId: string | null = null;
  let isSuperAdmin = false;

  if (authEnabled) {
    const user = await getAuthUser();
    if (!user) {
      redirect("/login?next=/dashboard");
    }

    [organizations, isSuperAdmin] = await Promise.all([
      getAccessibleOrganizations(),
      getIsSuperAdmin(),
    ]);
    if (organizations.length === 0) {
      redirect("/setup");
    }

    currentOrgId = await getCurrentOrganizationId(organizations);
  }

  const currentOrg = organizations.find((o) => o.id === currentOrgId);

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <DashboardSidebar
        organizations={organizations}
        currentOrgId={currentOrgId ?? undefined}
        authEnabled={authEnabled}
        organizationName={currentOrg?.name}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardMobileNav
          organizations={organizations}
          currentOrgId={currentOrgId ?? undefined}
          authEnabled={authEnabled}
          organizationName={currentOrg?.name}
          isSuperAdmin={isSuperAdmin}
        />
        <DataModeBanner
          authEnabled={authEnabled}
          organizationName={currentOrg?.name}
        />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
