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
- [ ] Replace demo data with live Supabase queries (agents, onboarding, academy done; scenarios/certs pending)

## Phase 2 — Core Modules (Weeks 3–5)

- [x] Agent Registry CRUD + search/filters (URL params + Supabase with demo fallback)
- [x] Onboarding checklist (read/write progress, toggle items)
- [x] Training programmes + modules CRUD + storage upload + assign to agent
- [ ] Scenario library + run history
- [ ] OpenAI evaluation wired to DB
- [ ] Certification issue + expiry jobs

## Phase 3 — Enterprise (Weeks 6–8)

- [ ] Governance audit log (auto-write on changes)
- [ ] Version control + rollback
- [ ] Performance snapshots (manual import or webhook)
- [ ] Incident → reassessment workflow
- [ ] Stripe checkout + webhook → plan limits
- [ ] Agent limit enforcement per plan

## Phase 4 — Pilot Hardening (Weeks 9–12)

- [ ] Role-based UI (hide write actions for Viewer)
- [ ] Super Admin org management
- [ ] Export audit pack (PDF)
- [ ] E2E tests (Playwright)
- [ ] Vercel production deploy + monitoring

## MVP Definition of Done

1. User signs up, creates org, invites team.
2. User registers agent, completes onboarding checklist.
3. User assigns training, runs scenario, receives AI score.
4. User requests certification; admin approves.
5. Audit log shows prompt change with actor.
6. Executive dashboard reflects live org data.
