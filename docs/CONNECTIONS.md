# AgentScale — Connected stack

## Production URLs

| Service | URL |
|---------|-----|
| **App** | https://agentscale.vercel.app |
| **Vercel project** | https://vercel.com/qfjcfc82cq-6912s-projects/agentscale |

## How services connect

```
GitHub (repo)
    │  push to main
    ▼
Vercel (build + host)
    │  env vars
    ├──► Supabase (Postgres + Auth + RLS)
    ├──► OpenAI (scenario evaluation)
    ├──► Stripe (subscriptions)
    ├──► Resend (contact emails)
    └──► Linear (task sync via GitHub Actions on push to main)
```

**Linear CI:** add `LINEAR_API_KEY` in GitHub Actions secrets — see [LINEAR_CI.md](LINEAR_CI.md).

## Check status in the app

**Settings → Connected services** (`/dashboard/settings`) shows live status from environment variables on that deployment.

## Local development sync

After connecting integrations in Vercel:

```bash
vercel env pull .env.local
# Set for local parity:
# NEXT_PUBLIC_APP_URL=http://localhost:3000

npm run dev
```

## Supabase (important)

AgentScale needs its **own schema** (`supabase/migrations/20240604000000_initial_schema.sql`).

Do **not** run that migration on unrelated projects (e.g. EnableFlow, RunPattern). Either:

1. Create a new Supabase project named **agentscale**, or  
2. Link it via Vercel → Integrations → Supabase  

Then run the migration in the SQL Editor and add keys to Vercel env.

## GitHub

If Vercel Git is connected, every push to `main` deploys production.  
Local clone should have:

```bash
git remote -v   # should show github.com/.../agentscale
```
