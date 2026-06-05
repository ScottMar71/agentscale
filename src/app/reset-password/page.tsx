import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { APP_NAME } from "@/lib/constants";
import { isAuthEnabled } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  if (!isAuthEnabled()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <CardTitle className="text-xl">Choose a new password</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {user
              ? "Enter a new password for your AgentScale account."
              : "Open the link from your email to set a new password."}
          </p>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm hasSession={Boolean(user)} />
        </CardContent>
      </Card>
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to sign in
      </Link>
    </div>
  );
}
