# AgentScale MVP Roadmap (8–12 weeks)

## Goal

Ship a **demo-ready, pilot-capable** platform: registry, onboarding, academy, scenario testing, certifications, governance audit trail, and executive dashboard.

## Phase 1 — Foundation (Weeks 1–2)

- [x] Next.js app scaffold + design system
- [x] Supabase schema + RLS migration
- [x] Landing page + contact API
- [ ] Supabase Auth (email + OAuth)
- [ ] Org creation + invite flow
- [ ] Replace demo data with live Supabase queries

## Phase 2 — Core Modules (Weeks 3–5)

- [ ] Agent Registry CRUD + search/filters
- [ ] Onboarding checklist (read/write progress)
- [ ] Training programmes + modules CRUD
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
