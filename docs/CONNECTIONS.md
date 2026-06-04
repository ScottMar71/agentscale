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

## Supabase

| Field | Value |
|-------|-------|
| **Project** | AgentScale (`rffhcgakipfispuqbhpg`) |
| **URL** | https://rffhcgakipfispuqbhpg.supabase.co |
| **Region** | eu-west-1 |
| **Dashboard** | https://supabase.com/dashboard/project/rffhcgakipfispuqbhpg |

Migrations applied: `initial_schema`, `create_organization`, `training_storage`, `harden_function_grants`.

Local keys live in `.env.local`. For production, add the same vars in Vercel (or `vercel env pull` after linking the integration).

**Auth redirect URLs** (Supabase → Authentication → URL configuration):

- Site URL: `http://localhost:3000` (dev) and `https://agentscale.vercel.app` (prod)
- Redirect URLs: `http://localhost:3000/auth/callback`, `https://agentscale.vercel.app/auth/callback`

Add `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API (server-only; Stripe webhooks).

## GitHub

If Vercel Git is connected, every push to `main` deploys production.  
Local clone should have:

```bash
git remote -v   # should show github.com/.../agentscale
```
