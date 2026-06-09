# Sentry production alerts (Milestone B — B5)

Ingestion is already wired (`SENTRY_DSN` on Vercel). B5 is the **notification** step: get emailed (or Slack) when a new production issue appears.

## Project context

| Item | Value |
|------|--------|
| Org | [agentscale](https://agentscale.sentry.io) |
| Project | `javascript-nextjs` |
| Region | EU (`de.sentry.io`) |
| Environment tag | `production` (from `VERCEL_ENV` on Vercel production) |
| Test page | https://www.agentscale.info/sentry-example-page |

## Create the alert (UI — ~3 minutes)

1. Open **[Create alert → Issues](https://agentscale.sentry.io/alerts/new/issue/?project=javascript-nextjs)** (or Alerts → Create Alert → Issues).

2. **Set conditions**
   - **WHEN:** *A new issue is created* (or *The issue's level is equal to* `error` if you want fewer noise alerts)
   - **IF (optional filter):** add filter → **The event's environment is equal to** → `production`
   - Leave frequency at default (e.g. alert once per issue)

3. **Set actions**
   - **THEN:** *Send a notification to* → **Email** → your address (or **Slack** if the workspace integration is installed)
   - Alternative: *Issue owners* / *Active members* if you prefer team routing

4. **Name** the rule e.g. `Production — new issue` and **Save**.

5. **Test**
   - Visit https://www.agentscale.info/sentry-example-page
   - Click **Throw Sample Error** (frontend + API)
   - Within ~1 minute, confirm the event in [Issues](https://agentscale.sentry.io/issues/?project=4511512112463952&environment=production)
   - Confirm you received the email/Slack notification

## Slack (optional)

1. Sentry → **Settings** → **Integrations** → **Slack** → Install
2. In the alert action, choose the channel (e.g. `#agentscale-alerts`)
3. Re-run the test above

## Verify Milestone B

B5 ingestion is automated (`verify:milestone-b` hits `/api/sentry-example-api`). The alert rule itself is manual — check it off when:

- [ ] Rule exists with `environment = production` filter
- [ ] Test error triggers a notification to email or Slack

Then re-run:

```bash
npm run verify:milestone-b
```

The script will still show the B5 manual reminder; mark [AGE-45](https://linear.app/agentscale/issue/AGE-45) Done in Linear after you confirm notifications work.

## Optional — API setup

If you use a Sentry org auth token (`alerts:write` scope), you can create rules via API. Store the token in `~/.cursor/sentry.env` (not committed):

```env
SENTRY_AUTH_TOKEN=sntryu_...
SENTRY_ORG=agentscale
SENTRY_PROJECT=javascript-nextjs
SENTRY_REGION=de
```

Legacy issue alert endpoint (EU):

```bash
curl -X POST "https://de.sentry.io/api/0/projects/agentscale/javascript-nextjs/rules/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production — new issue",
    "environment": "production",
    "actionMatch": "all",
    "filterMatch": "all",
    "frequency": 30,
    "conditions": [
      { "id": "sentry.rules.filters.tagged_event", "key": "environment", "match": "eq", "value": "production" },
      { "id": "sentry.rules.conditions.first_seen_event" }
    ],
    "actions": [
      { "id": "sentry.mail.actions.NotifyEmailAction", "targetType": "Team", "targetIdentifier": null }
    ]
  }'
```

Adjust `actions` for your email target type (`User`, `Team`, or `IssueOwners`).

## Related

- `docs/MILESTONE_B.md`
- `docs/DEPLOYMENT.md` (Sentry verification)
- `src/app/sentry-example-page/page.tsx`
