# E2E tests in GitHub Actions

Playwright runs on every push to `main` and on pull requests.

## What runs in CI (no secrets)

Without Supabase env vars, the app runs in **demo mode**:

- Landing, login, pricing smoke tests
- Health check (`GET /api/health`)
- Demo-mode banner test (when auth is disabled)

## Optional secrets (authenticated pilot journey)

Add in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `PLAYWRIGHT_TEST_EMAIL` | Test user email (Supabase Auth) |
| `PLAYWRIGHT_TEST_PASSWORD` | Test user password |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

When all four are set, CI also runs the authenticated pilot journey (login → dashboard → registry).

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
