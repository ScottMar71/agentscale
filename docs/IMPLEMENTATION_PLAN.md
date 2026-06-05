# AgentScale Implementation Plan

## Ordered tasks (granular)

### Sprint 1 — Auth & tenancy
1. Enable Supabase Auth (email/password + magic link)
2. `src/app/auth/callback/route.ts` for OAuth callback
3. Server-side session in dashboard layout; redirect unauthenticated users
4. `createOrganization` server action + seed first member as `org_admin`
5. Org switcher in header (multi-org users)

### Sprint 2 — Agent Registry (live data)
6. `src/lib/data/agents.ts` — Supabase queries with fallback to demo
7. Agent create/edit forms with Zod validation
8. Wire filters to URL search params
9. Audit log write on agent create/update

### Sprint 3 — Onboarding & Academy ✅
10. CRUD `training_programs` / `training_modules`
11. `agent_onboarding` progress API
12. Module content upload → Supabase Storage
13. Assign programme to agent

### Sprint 4 — Scenario engine ✅
14. Scenario CRUD UI
15. Run scenario UI (paste agent response or call external agent webhook)
16. Persist `scenario_runs` after `/api/evaluate`
17. Pass/fail gate for certification rules (onboarding checklist on pass)

### Sprint 5 — Certifications & governance ✅
18. Certification request workflow + approver inbox
19. Audit pack export (downloadable text report)
20. Auto-expire certs cron (Vercel Cron + service role)
21. Governance dashboard from live aggregates

### Sprint 6 — Billing & production ✅
22. Stripe Customer Portal
23. Enforce `agent_limit` on create
24. Sentry + Vercel Analytics
25. Playwright smoke tests

## Testing approach

| Layer | Tool |
|-------|------|
| Unit | Vitest for Zod schemas, eval parsers |
| API | curl / Postman collections for `/api/*` |
| E2E | Playwright: landing → dashboard → agent detail |
| RLS | Supabase SQL tests as different roles |

## Definition of done (per module)

- **Registry:** CRUD + RLS + audit log entry
- **Scenarios:** Create scenario → evaluate → result in DB
- **Certs:** Issue cert only when rules pass + approver signs off
