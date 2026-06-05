import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PlatformOrgTable } from "@/components/admin/platform-org-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIsSuperAdmin } from "@/lib/auth/session";
import { listPlatformOrganizations } from "@/lib/data/admin";

export default async function PlatformAdminPage() {
  if (!(await getIsSuperAdmin())) {
    redirect("/dashboard");
  }

  const organizations = await listPlatformOrganizations();

  return (
    <>
      <DashboardHeader
        title="Platform Admin"
        description="Manage all tenant organisations, plans, and agent limits"
        badge="Super Admin"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Organisations ({organizations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <PlatformOrgTable organizations={organizations} />
          </CardContent>
        </Card>
        <p className="mt-4 text-xs text-muted-foreground">
          Grant super admin via Supabase:{" "}
          <code className="rounded bg-muted px-1 font-mono">
            UPDATE profiles SET is_super_admin = true WHERE email = &apos;you@company.com&apos;;
          </code>
        </p>
      </div>
    </>
  );
}
