# AgentScale

**The System of Record for AI Workers.**

Enterprise AI Workforce Management Platform — onboard, train, certify, govern, and optimise AI agents across your organisation.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| Payments | Stripe |
| Email | Resend |
| AI | OpenAI API |
| Hosting | Vercel |

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the product UI (demo data mode).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration: `supabase/migrations/20240604000000_initial_schema.sql` via SQL Editor or CLI.
3. Optional: run `supabase/seed.sql` for global certification templates.
4. Add URL and keys to `.env.local`.

```bash
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

## Environment variables

See [.env.example](.env.example) for all keys.

## Product modules

- **Agent Registry** — `/dashboard/agents`
- **Onboarding** — `/dashboard/onboarding`
- **Training Academy** — `/dashboard/academy`
- **Scenario Testing** — `/dashboard/scenarios`
- **Certifications** — `/dashboard/certifications`
- **Performance** — `/dashboard/performance`
- **Governance** — `/dashboard/governance`
- **Version Control** — `/dashboard/versions`
- **Continuous Improvement** — `/dashboard/incidents`
- **Executive Dashboard** — `/dashboard`

## API

| Route | Description |
|-------|-------------|
| `POST /api/contact` | Demo request → Resend |
| `POST /api/evaluate` | AI scenario evaluation |
| `POST /api/stripe/checkout` | Subscription checkout |
| `POST /api/stripe/webhook` | Stripe → org plan sync |

## Linear (project tasks)

Linear is configured **globally** for all Cursor projects (`~/.cursor/rules/linear-tasks.mdc`, `~/.cursor/skills/linear-tasks/`).

1. Copy `~/.cursor/linear.env.example` → `~/.cursor/linear.env` and add your API key from [linear.app/settings/api](https://linear.app/settings/api).
2. Optional per-repo override: `LINEAR_TEAM_ID` in `.env.local` (default team: **AgentScale**).
3. Run `npm run linear:sync` to create issues from `docs/IMPLEMENTATION_PLAN.md` (skips issues that already exist by title).

Use the **Linear** Cursor plugin in chat for issues in any repo (OAuth, no API key required).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [MVP Roadmap](docs/MVP_ROADMAP.md)
- [Production Roadmap](docs/PRODUCTION_ROADMAP.md)

## Roles

| Role | Capabilities |
|------|----------------|
| Super Admin | All orgs, billing, global templates |
| Organisation Admin | Users, agents, training, certs |
| Manager | Assign training, review assessments |
| Viewer | Read-only |

## License

Proprietary — AgentScale © 2026
