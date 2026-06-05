import Link from "next/link";
import { acceptInviteFromForm } from "@/app/actions/team";
import { getInviteByToken } from "@/lib/data/team";
import { getAuthUser } from "@/lib/auth/session";
import { isAuthEnabled } from "@/lib/auth/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isAuthEnabled()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invitations unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Connect Supabase to accept workspace invitations.
          </CardContent>
        </Card>
      </main>
    );
  }

  const invite = await getInviteByToken(token);
  const user = await getAuthUser();

  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invite not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This invitation link is invalid or has expired.</p>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
              Sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (invite.accepted_at) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Already accepted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This invitation was already used.</p>
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invite expired</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ask your organisation admin to send a new invitation.
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Join {invite.organization_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              You&apos;ve been invited as{" "}
              <span className="font-medium capitalize text-foreground">
                {invite.role.replace("_", " ")}
              </span>
              . Sign in or create an account with <strong>{invite.email}</strong> to accept.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/login?next=/invite/${token}`}
                className={cn(buttonVariants())}
              >
                Sign in
              </Link>
              <Link
                href={`/signup?next=/invite/${token}&email=${encodeURIComponent(invite.email)}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const emailMatches =
    user.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Join {invite.organization_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!emailMatches ? (
            <>
              <p className="text-destructive">
                This invite was sent to {invite.email}, but you&apos;re signed in as {user.email}.
              </p>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
                Switch account
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Accept your invitation as{" "}
                <span className="font-medium capitalize text-foreground">
                  {invite.role.replace("_", " ")}
                </span>
                .
              </p>
              <form action={acceptInviteFromForm}>
                <input type="hidden" name="token" value={token} />
                <Button type="submit">Accept invitation</Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
