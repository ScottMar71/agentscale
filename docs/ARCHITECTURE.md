# AgentScale Architecture

## Vision

AgentScale is the **System of Record for AI Workers** — an enterprise SaaS platform for onboarding, training, certifying, governing, and optimising AI agents across an organisation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel (Edge + Node)                      │
│  ┌──────────────────┐    ┌──────────────────────────────────┐ │
│  │ Next.js 15 App   │    │ API Routes                        │ │
│  │ · Marketing      │    │ · /api/contact (Resend)           │ │
│  │ · Dashboard      │    │ · /api/evaluate (OpenAI)          │ │
│  │ · Server Actions │    │ · /api/stripe/* (Billing)         │ │
│  └────────┬─────────┘    └──────────────┬───────────────────┘ │
└───────────┼──────────────────────────────┼─────────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐      ┌────────────────────┐
│ Supabase              │      │ External Services   │
│ · Auth (JWT)          │      │ · OpenAI            │
│ · PostgreSQL + RLS    │      │ · Stripe            │
│ · Storage (future)    │      │ · Resend            │
│ · Realtime (future)   │      │ · Langfuse (opt.)   │
└───────────────────────┘      └────────────────────┘
```

## Multi-Tenancy

- Every tenant-scoped row includes `organization_id`.
- `organization_members` links users to orgs with roles: `org_admin`, `manager`, `viewer`.
- `profiles.is_super_admin` enables platform-wide Super Admin (orgs, billing, templates).
- RLS policies use helper functions: `user_organization_ids()`, `can_write_org()`, `is_super_admin()`.

## Module → Data Mapping

| Module | Primary tables |
|--------|----------------|
| Agent Registry | `agents`, `agent_versions` |
| Onboarding | `agent_onboarding`, `onboarding_templates` |
| Training Academy | `training_programs`, `training_modules`, `agent_training_progress` |
| Scenario Testing | `test_scenarios`, `scenario_runs` |
| Certifications | `certification_definitions`, `agent_certifications` |
| Performance | `performance_snapshots` |
| Governance | `audit_logs` |
| Version Control | `agent_versions` |
| Continuous Improvement | `incidents` |

## API Structure

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/contact` | POST | Demo/contact form → Resend |
| `/api/evaluate` | POST | AI scenario scoring → OpenAI |
| `/api/stripe/checkout` | POST | Create Checkout session |
| `/api/stripe/webhook` | POST | Sync subscription → `organizations` |

## Folder Structure

```
src/
├── app/
│   ├── (dashboard)/          # Authenticated app shell
│   │   ├── layout.tsx
│   │   └── dashboard/        # All product modules
│   ├── api/                  # Route handlers
│   ├── login/
│   └── page.tsx              # Landing
├── components/
│   ├── agents/
│   ├── dashboard/
│   ├── layout/
│   ├── marketing/
│   └── ui/                   # shadcn
├── lib/
│   ├── supabase/
│   ├── openai/
│   ├── stripe.ts
│   ├── resend.ts
│   └── demo-data.ts          # Demo mode without Supabase
└── types/
supabase/
├── migrations/
└── seed.sql
docs/
```

## Security

- Never use `user_metadata` for authorization (Supabase best practice).
- Store roles in `organization_members`, not JWT custom claims alone.
- Service role key only on server (webhooks, admin jobs).
- Contact form inserts via API route (service role) or Edge Function — not public anon insert in production without rate limiting.

## Design System

- **Primary:** Midnight Navy `#0B1426`, Deep Blue `#1E3A5F`
- **Accent:** Electric Blue `#2563EB`
- **UI:** shadcn/ui + Tailwind v4
- **Tone:** Workday / Linear / Vanta — corporate, minimal, trustworthy

## AI Evaluation Flow

1. Admin defines scenario in `test_scenarios`.
2. Agent (or human tester) submits response.
3. `POST /api/evaluate` calls OpenAI with rubric JSON output.
4. Results stored in `scenario_runs` with metrics and pass/fail.
5. Certification engine checks scenario pass rules before issuing cert.
