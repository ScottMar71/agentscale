import { isAuthEnabled } from "@/lib/auth/config";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    auth: isAuthEnabled(),
    supabase: isSupabaseConfigured(),
    sentry: Boolean(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };

  return Response.json(
    {
      status: "ok",
      service: "agentscale",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: 200 }
  );
}
