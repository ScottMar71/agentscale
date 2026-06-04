import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";
import { isAuthEnabled } from "@/lib/auth/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/dashboard";

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
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your AgentScale workspace.
          </p>
        </CardHeader>
        <CardContent>
          {!isAuthEnabled() ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Supabase is not configured. Use demo mode to explore the dashboard with
                sample data.
              </p>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                Continue in demo mode
              </Link>
            </div>
          ) : (
            <>
              {error === "auth_callback_failed" && (
                <p role="alert" className="mb-4 text-sm font-medium text-destructive">
                  Sign-in link expired or is invalid. Try again.
                </p>
              )}
              <LoginForm next={nextPath} />
            </>
          )}
        </CardContent>
      </Card>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
    </div>
  );
}
