import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { SetupOrganizationForm } from "@/components/auth/setup-organization-form";
import { isAuthEnabled } from "@/lib/auth/config";
import { getAuthUser, getUserOrganizations } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";

export default async function SetupPage() {
  if (!isAuthEnabled()) {
    redirect("/login");
  }

  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/setup");
  }

  const orgs = await getUserOrganizations();
  if (orgs.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-10">
      <Link
        href="/"
        className="mb-8 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${APP_NAME} home`}
      >
        <Logo wordmarkClassName="text-foreground" markClassName="h-9 w-9" />
      </Link>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your workspace</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            One last step — name the organization where your AI agents will live.
          </p>
        </CardHeader>
        <CardContent>
          <SetupOrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
