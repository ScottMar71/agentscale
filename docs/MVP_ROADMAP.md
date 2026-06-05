# AgentScale MVP Roadmap (8–12 weeks)

## Goal

Ship a **demo-ready, pilot-capable** platform: registry, onboarding, academy, scenario testing, certifications, governance audit trail, and executive dashboard.

## Phase 1 — Foundation (Weeks 1–2)

- [x] Next.js app scaffold + design system
- [x] Supabase schema + RLS migration
- [x] Landing page + contact API
- [x] Supabase Auth (email/password + magic link)
- [x] Org creation on first sign-up (`/setup` + `create_organization` RPC)
- [ ] Org invite flow
- [ ] Replace demo data with live Supabase queries (agents, onboarding, academy, scenarios done; certs/dashboard pending)

## Phase 2 — Core Modules (Weeks 3–5)

- [x] Agent Registry CRUD + search/filters (URL params + Supabase with demo fallback)
- [x] Onboarding checklist (read/write progress, toggle items)
- [x] Training programmes + modules CRUD + storage upload + assign to agent
- [x] Scenario library + run history (CRUD, run UI, persist `scenario_runs`)
- [x] OpenAI evaluation wired to DB (`/api/evaluate` + server actions)
- [x] Certification request + approver inbox + expiry cron

## Phase 3 — Enterprise (Weeks 6–8)

- [x] Governance centre with live audit log + export
- [ ] Version control + rollback
- [ ] Performance snapshots (manual import or webhook)
- [ ] Incident → reassessment workflow
- [x] Stripe checkout + Customer Portal + webhook → plan limits
- [x] Agent limit enforcement per plan

## Phase 4 — Pilot Hardening (Weeks 9–12)

- [ ] Role-based UI (hide write actions for Viewer)
- [ ] Super Admin org management
- [ ] Export audit pack (PDF)
- [x] E2E smoke tests (Playwright)
- [ ] Vercel production deploy + monitoring (Sentry DSN optional)

## MVP Definition of Done

1. User signs up, creates org, invites team.
2. User registers agent, completes onboarding checklist.
3. User assigns training, runs scenario, receives AI score.
4. User requests certification; admin approves.
5. Audit log shows prompt change with actor.
6. Executive dashboard reflects live org data.
