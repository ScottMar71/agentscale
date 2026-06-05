import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { APP_NAME } from "@/lib/constants";
import { isAuthEnabled } from "@/lib/auth/config";

export default function ForgotPasswordPage() {
  if (!isAuthEnabled()) {
    redirect("/login");
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
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your work email and we&apos;ll send you a link to choose a new password.
          </p>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
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
