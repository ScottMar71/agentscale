---
tags:
  - agentscale
  - product
---

# AgentScale — Features

## Platform modules

| Module | Route | Status |
|--------|-------|--------|
| Agent Registry | `/dashboard/agents` | **Live** (demo fallback when Supabase unset) |
| Onboarding | `/dashboard/onboarding` | **Live** |
| Training Academy | `/dashboard/academy` | **Live** + Storage upload |
| Scenario Testing | `/dashboard/scenarios` | **Live** + `/api/evaluate` |
| Certifications | `/dashboard/certifications` | **Live** + expiry cron |
| Performance | `/dashboard/performance` | **Live** (import + webhook) |
| Governance | `/dashboard/governance` | **Live** + audit export |
| Version Control | `/dashboard/versions` | **Live** |
| Continuous Improvement | `/dashboard/incidents` | **Live** |
| Executive Dashboard | `/dashboard` | **Live** |
| Demo tour | `/dashboard/demo` | **Demo data** (sales walkthrough) |
| Settings | `/dashboard/settings` | **Live** |
| Super Admin | `/dashboard/admin` | **Live** (super_admin only) |
| Billing | Settings → Stripe | **Live** |

## Core capabilities

### Agent Registry
- CRUD agents with department, owner, risk level, tags
- Model provider, prompt version, tool stack metadata
- Health score and certification status
- Agent limit enforcement per plan

### Onboarding
- Template checklists (global + org-specific)
- Per-agent progress tracking

### Training Academy
- Programmes and modules
- Progress per agent; content via Supabase Storage

### Scenario Testing
- Scenario library with rubric JSON
- `POST /api/evaluate` → OpenAI structured scoring
- Pass/fail stored in `scenario_runs`
- Certification gate integration

### Certifications
- Definitions + agent certifications
- Approval workflow; expiry and revoke
- Vercel Cron auto-expire

### Governance
- `audit_logs` for prompt/model/deploy changes
- Audit pack export (text + PDF)

### Billing
- Stripe checkout + webhook sync to `organizations`
- Enforce `agent_limit` per plan
- Customer Portal

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, TypeScript, Tailwind v4, shadcn/ui |
| Backend | Supabase Auth, PostgreSQL, RLS |
| AI | OpenAI API |
| Email | Resend |
| Payments | Stripe |
| Hosting | Vercel |
| Observability | Sentry, Vercel Analytics |

## MVP status

MVP complete — see `docs/MVP_ROADMAP.md` and `docs/IMPLEMENTATION_PLAN.md`.

- [x] Supabase Auth + org creation
- [x] Live data (demo fallback for unset env)
- [x] Registry CRUD + audit writes
- [x] Scenario runs persisted
- [x] Certification workflow
- [x] Stripe plan limits
- [x] Playwright E2E + production verification

## Post-MVP (Q1)

- [x] Milestone B pre-flight (partner onboarding gate)
- [ ] Design partner programme (3–5 pilots) — tooling shipped, outreach next
- [ ] Langfuse / OpenTelemetry integration (planned)

## Related

- [[User-Stories]]
- [[Database-Schema]]
- [[Vision]]
- [[Partner-Onboarding]]
- [[Documentation/ARCHITECTURE]]
- [[Documentation/IMPLEMENTATION_PLAN]]
