# Milestone B — Partner Onboarding Pre-flight

Gate before onboarding design partners. Run automated checks locally, then confirm manual dashboard items.

## Quick check

```bash
npm run verify:milestone-b
```

Target: **7/7 automated** passes + manual items confirmed.

## Checklist (B1–B6)

| ID | Check | How to verify | Owner |
|----|-------|---------------|-------|
| B1 | GitHub E2E CI | Latest `e2e.yml` run on `main` is green | Engineering |
| B2 | Production health | `GET /api/health` → `status: ok`, auth/supabase/sentry/openai | Engineering |
| B3 | Auth callback | Invalid OAuth → `/login?error=auth_callback_failed` | Engineering |
| B3 | Supabase redirect URLs | Dashboard → Auth → URL config includes `https://www.agentscale.info/auth/callback` | Engineering |
| B4 | Resend deliverability | `agentscale.info` domain verified; invite/contact emails send | Engineering |
| B5 | Sentry ingestion | `/api/sentry-example-api` returns 500 (test route) | Engineering |
| B5 | Sentry alert rule | New issue in `production` → email or Slack | Engineering |
| B6 | Cert expiry cron | Unauthenticated → 401; with `CRON_SECRET` → 200 | Engineering |

## B1 — GitHub Actions secrets

Add in **GitHub → ScottMar71/agentscale → Settings → Secrets → Actions**:

| Secret | Source |
|--------|--------|
| `PLAYWRIGHT_TEST_EMAIL` | Output of `npm run provision:e2e-user` |
| `PLAYWRIGHT_TEST_PASSWORD` | Output of `npm run provision:e2e-user` |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |

Re-run the E2E workflow on `main` after adding secrets (Actions → E2E tests → Run workflow, or Re-run failed jobs).

**Important:** `npm run provision:e2e-user` generates a new password each run unless `E2E_TEST_PASSWORD` is set. After provisioning, update both `.env.local` and GitHub `PLAYWRIGHT_TEST_PASSWORD` to match.

## Partner support runbook

When a design partner reports an issue:

1. **Auth / login** — Check Supabase Auth logs; confirm redirect URLs and email deliverability (B3, B4).
2. **Empty dashboard** — Run `npm run seed:pilot -- --slug <org-slug>` or guide them to register first agent.
3. **Scenario evaluation fails** — Check `/api/health` OpenAI check; verify org has not hit plan limits.
4. **Certification stuck** — Confirm approver has `manager` or `org_admin` role; check `agent_certifications` status.
5. **Invite email not received** — Resend domain verification; check spam; use magic link as fallback.

Escalation: check Sentry for production errors; Vercel deployment logs for API route failures.

## B5 — Sentry production alert (manual)

Full walkthrough: **`docs/SENTRY_ALERTS.md`**

Quick path:

1. [Create issue alert](https://agentscale.sentry.io/alerts/new/issue/?project=javascript-nextjs) for project `javascript-nextjs`
2. **WHEN:** A new issue is created
3. **IF:** event environment equals `production`
4. **THEN:** Email (or Slack) to you / `#agentscale-alerts`
5. Test via https://www.agentscale.info/sentry-example-page → confirm notification received

Mark [AGE-45](https://linear.app/agentscale/issue/AGE-45) Done after the test email/Slack arrives.

## Related

- `scripts/verify-milestone-b-preflight.mjs`
- `docs/SENTRY_ALERTS.md`
- `docs/PRODUCTION_ROADMAP.md` (Q1)
- `docs/product/Partner-Onboarding.md` (Sprint 11)
