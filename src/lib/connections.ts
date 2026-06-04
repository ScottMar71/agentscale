export type ConnectionStatus = "connected" | "partial" | "not_configured";

export interface ServiceConnection {
  id: string;
  name: string;
  status: ConnectionStatus;
  detail: string;
  docsUrl?: string;
}

function hasEnv(key: string): boolean {
  const v = process.env[key];
  return Boolean(v && v.trim().length > 0);
}

export function getServiceConnections(): ServiceConnection[] {
  const supabaseUrl = hasEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnon = hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabaseService = hasEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseOk = supabaseUrl && supabaseAnon;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const isProductionUrl = appUrl.includes("agentscale.vercel.app") || appUrl.includes("vercel.app");

  return [
    {
      id: "vercel",
      name: "Vercel",
      status: "connected",
      detail: isProductionUrl
        ? `Hosting — ${appUrl}`
        : "Hosting — https://agentscale.vercel.app",
      docsUrl: "https://vercel.com/qfjcfc82cq-6912s-projects/agentscale",
    },
    {
      id: "github",
      name: "GitHub",
      status: process.env.VERCEL_GIT_REPO_SLUG ? "connected" : "partial",
      detail: process.env.VERCEL_GIT_REPO_SLUG
        ? `Repo — ${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
        : "Connect repo in Vercel → Settings → Git (deploys on push)",
      docsUrl: "https://vercel.com/qfjcfc82cq-6912s-projects/agentscale/settings/git",
    },
    {
      id: "supabase",
      name: "Supabase",
      status: supabaseOk ? (supabaseService ? "connected" : "partial") : "not_configured",
      detail: supabaseOk
        ? supabaseService
          ? "Database, Auth, RLS — keys configured"
          : "Client keys set — add SUPABASE_SERVICE_ROLE_KEY for webhooks/admin"
        : "Add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY (Vercel integration or .env.local)",
      docsUrl: "https://supabase.com/dashboard",
    },
    {
      id: "openai",
      name: "OpenAI",
      status: hasEnv("OPENAI_API_KEY") ? "connected" : "not_configured",
      detail: hasEnv("OPENAI_API_KEY")
        ? "Scenario evaluation API ready"
        : "Required for /api/evaluate scenario scoring",
    },
    {
      id: "stripe",
      name: "Stripe",
      status:
        hasEnv("STRIPE_SECRET_KEY") && hasEnv("STRIPE_WEBHOOK_SECRET")
          ? "connected"
          : hasEnv("STRIPE_SECRET_KEY")
            ? "partial"
            : "not_configured",
      detail: hasEnv("STRIPE_SECRET_KEY")
        ? "Billing — checkout & webhooks"
        : "Starter / Growth / Enterprise plans",
      docsUrl: "https://dashboard.stripe.com",
    },
    {
      id: "resend",
      name: "Resend",
      status: hasEnv("RESEND_API_KEY") ? "connected" : "partial",
      detail: hasEnv("RESEND_API_KEY")
        ? "Contact & demo request emails"
        : "Demo form logs locally without RESEND_API_KEY",
      docsUrl: "https://resend.com",
    },
    {
      id: "linear",
      name: "Linear",
      status: hasEnv("LINEAR_API_KEY") ? "connected" : "partial",
      detail: hasEnv("LINEAR_API_KEY")
        ? `Team — ${process.env.LINEAR_TEAM_ID ?? "configured"}`
        : process.env.LINEAR_TEAM_ID
          ? `Team ID set (${process.env.LINEAR_TEAM_ID}) — add LINEAR_API_KEY for sync`
          : "Optional task sync",
    },
  ];
}

export function isDemoMode(): boolean {
  return !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
