"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithPassword, signInWithMagicLink, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initial: AuthActionState = {};

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initial
  );
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    initial
  );

  return (
    <Tabs defaultValue="password" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="magic">Magic link</TabsTrigger>
      </TabsList>

      <TabsContent value="password" className="mt-4 space-y-4">
        <form action={passwordAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
          {passwordState.error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {passwordState.error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={passwordPending}>
            {passwordPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="magic" className="mt-4 space-y-4">
        <form action={magicAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <Label htmlFor="magic-email">Work email</Label>
            <Input
              id="magic-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>
          {magicState.error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {magicState.error}
            </p>
          )}
          {magicState.message && (
            <p role="status" className="text-sm font-medium text-success">
              {magicState.message}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={magicPending}>
            {magicPending ? "Sending link…" : "Email me a sign-in link"}
          </Button>
        </form>
      </TabsContent>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        New to AgentScale?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </Tabs>
  );
}
