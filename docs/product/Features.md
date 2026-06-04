---
tags:
  - agentscale
  - product
---

# AgentScale — Features

## Platform modules

| Module | Route | Status |
|--------|-------|--------|
| Agent Registry | `/dashboard/agents` | Demo + schema ready |
| Onboarding | `/dashboard/onboarding` | Demo |
| Training Academy | `/dashboard/academy` | Demo |
| Scenario Testing | `/dashboard/scenarios` | Demo + `/api/evaluate` |
| Certifications | `/dashboard/certifications` | Demo |
| Performance | `/dashboard/performance` | Demo |
| Governance | `/dashboard/governance` | Demo |
| Version Control | `/dashboard/versions` | Demo |
| Continuous Improvement | `/dashboard/incidents` | Demo |
| Executive Dashboard | `/dashboard` | Demo |
| Settings | `/dashboard/settings` | In progress |

## Core capabilities

### Agent Registry
- CRUD agents with department, owner, risk level, tags
- Model provider, prompt version, tool stack metadata
- Health score and certification status

### Onboarding
- Template checklists (global + org-specific)
- Per-agent progress tracking

### Training Academy
- Programmes and modules
- Progress per agent; content via Supabase Storage (planned)

### Scenario Testing
- Scenario library with rubric JSON
- `POST /api/evaluate` → OpenAI structured scoring
- Pass/fail stored in `scenario_runs`

### Certifications
- Definitions + agent certifications
- Approval workflow; expiry and revoke

### Governance
- `audit_logs` for prompt/model/deploy changes
- Export audit pack (PDF — planned)

### Billing
- Stripe checkout + webhook sync to `organizations`
- Enforce `agent_limit` per plan

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind v4, shadcn/ui |
| Backend | Supabase Auth, PostgreSQL, RLS |
| AI | OpenAI API |
| Email | Resend |
| Payments | Stripe |
| Hosting | Vercel |

## MVP scope (8–12 weeks)

See repo: `docs/MVP_ROADMAP.md`

- [ ] Supabase Auth + org creation
- [ ] Live data (replace demo mode)
- [ ] Registry CRUD + audit writes
- [ ] Scenario runs persisted
- [ ] Certification workflow
- [ ] Stripe plan limits

## Related

- [[User-Stories]]
- [[Database-Schema]]
- [[Vision]]
- [[Documentation/ARCHITECTURE]]
- [[Documentation/IMPLEMENTATION_PLAN]]
