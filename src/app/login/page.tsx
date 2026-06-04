import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] px-4">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1426] text-sm font-bold text-white">
            AS
          </div>
          <CardTitle>Sign in to {APP_NAME}</CardTitle>
          <p className="text-sm text-slate-500 mt-2">
            Connect Supabase Auth to enable production login.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-1" placeholder="you@company.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" className="mt-1" />
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants(), "w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white")}
          >
            Continue to dashboard (demo)
          </Link>
          <p className="text-center text-xs text-slate-500">
            <Link href="/" className="text-[#2563EB] hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
