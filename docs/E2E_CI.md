# E2E tests in GitHub Actions

Playwright runs on every push to `main` and on pull requests.

## What runs in CI

E2E tests run against **production** (`PLAYWRIGHT_BASE_URL=https://www.agentscale.info`) — no local dev server needed.

Without Supabase secrets, smoke + health tests still run; authenticated journey is skipped.

## Provision test user

```bash
npm run provision:e2e-user
```

Creates `e2e-test@agentscale.info` (or `E2E_TEST_EMAIL`) with org + agent. Prints `PLAYWRIGHT_TEST_EMAIL` and `PLAYWRIGHT_TEST_PASSWORD` for local `.env.local` and GitHub Actions.

## Required secrets (authenticated pilot journey)

Add in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `PLAYWRIGHT_TEST_EMAIL` | Test user email (from `provision:e2e-user`) |
| `PLAYWRIGHT_TEST_PASSWORD` | Test user password |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

When all four are set, CI also runs the authenticated pilot journey (login → dashboard → registry).

## Production validation

```bash
npm run verify:production   # health, routes, Sentry, auth guard
npm run validate:mvp        # MVP DoD route checks
PLAYWRIGHT_BASE_URL=https://www.agentscale.info npm run test:e2e
```

## Local run

```bash
npm run test:e2e
```

With auth:

```bash
PLAYWRIGHT_TEST_EMAIL=you@example.com PLAYWRIGHT_TEST_PASSWORD=secret npm run test:e2e
```

## Workflow file

`.github/workflows/e2e.yml`
