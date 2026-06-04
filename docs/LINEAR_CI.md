# Linear sync on deploy (GitHub Actions)

When code is pushed to `main`, GitHub Actions runs `npm run linear:sync` so new tasks from `src/lib/linear/tasks.ts` appear in your **AgentScale** Linear team. Existing issues are skipped (matched by title).

## One-time setup

### 1. Add GitHub secret

1. Open your repo on GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
   - Name: `LINEAR_API_KEY`
   - Value: your key from [linear.app/settings/api](https://linear.app/settings/api) (same as `~/.cursor/linear.env`)

### 2. Optional: team override

**Settings** → **Secrets and variables** → **Actions** → **Variables**

| Name | Value | Default |
|------|--------|---------|
| `LINEAR_TEAM_ID` | Team key (`ENG`) or UUID | `AgentScale` |

### 3. Push the workflow

Ensure `.github/workflows/linear-sync.yml` is on `main` (commit and push).

## When it runs

| Trigger | Behavior |
|---------|----------|
| Push to `main` | Runs if Linear-related files changed |
| **Actions → Sync Linear tasks → Run workflow** | Manual run anytime |

Linear-related paths:

- `src/lib/linear/**`
- `docs/IMPLEMENTATION_PLAN.md`
- `scripts/sync-linear-tasks.ts`
- `.github/workflows/linear-sync.yml`

## Relationship to Vercel

Vercel deploys on the same `main` push. Linear sync runs in parallel in GitHub Actions — it does **not** wait for Vercel to finish, and it does not update issue status when deploy succeeds.

To also sync on **every** production deploy regardless of files changed, use **Run workflow** manually or remove the `paths:` filter in the workflow file.

## Add new tasks

1. Edit `src/lib/linear/tasks.ts` (keep in sync with `docs/IMPLEMENTATION_PLAN.md`)
2. Push to `main`
3. Action creates only **new** issues; duplicates are skipped

## Troubleshooting

| Error | Fix |
|-------|-----|
| `LINEAR_API_KEY secret is not set` | Add the secret (step 1) |
| `Team "X" not found` | Set `LINEAR_TEAM_ID` variable to your team key or UUID |
| All tasks skipped | Expected — issues already exist |
