# Deploy AgentScale — GitHub + Vercel

## Prerequisites

- GitHub account
- [Vercel account](https://vercel.com) (logged in as CLI: `vercel whoami`)
- Supabase project (for production data)

---

## 1. GitHub

### Option A — GitHub website

1. Create a new repository at https://github.com/new  
   - Name: `agentscale` (or your choice)  
   - **Do not** add README, .gitignore, or license (this repo already has them)

2. From the project root:

```bash
git add -A
git commit -m "feat: AgentScale MVP — AI workforce management platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agentscale.git
git push -u origin main
```

### Option B — GitHub CLI

```bash
brew install gh
gh auth login
gh repo create agentscale --private --source=. --remote=origin --push
```

---

## 2. Vercel (CLI)

Link and deploy from `/Users/scottmaryan/Desktop/agent`:

```bash
vercel link --yes --project agentscale
vercel env pull .env.local   # optional: sync from Vercel after adding vars in dashboard
vercel --prod
```

### Option — Vercel + GitHub (recommended for CI)

1. Push code to GitHub (step 1).
2. Go to [vercel.com/new](https://vercel.com/new).
3. **Import** your `agentscale` repository.
4. Framework preset: **Next.js** (auto-detected).
5. Add environment variables (see below).
6. Deploy — every push to `main` deploys production; PRs get preview URLs.

---

## 3. Environment variables (Vercel Dashboard)

Project → Settings → Environment Variables. Add for **Production**, **Preview**, and **Development**:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never expose to client |
| `OPENAI_API_KEY` | Scenario evaluation |
| `STRIPE_SECRET_KEY` | Billing |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint |
| `STRIPE_PRICE_STARTER` | Stripe Price ID |
| `STRIPE_PRICE_GROWTH` | Stripe Price ID |
| `STRIPE_PRICE_ENTERPRISE` | Stripe Price ID |
| `RESEND_API_KEY` | Contact form |
| `RESEND_FROM_EMAIL` | Verified sender |
| `CONTACT_EMAIL` | Inbox for demo requests |

After adding vars in Vercel:

```bash
vercel env pull .env.local
```

---

## 4. Supabase

1. Run `supabase/migrations/20240604000000_initial_schema.sql` in the SQL Editor.
2. Optional: run `supabase/seed.sql`.
3. Auth → URL configuration: add your Vercel URL to **Redirect URLs**.
4. Stripe webhook URL: `https://your-app.vercel.app/api/stripe/webhook`

---

## 5. Verify deployment

```bash
vercel ls
curl -I https://your-project.vercel.app
```

Open `/dashboard` for the product UI and `/` for the landing page.
