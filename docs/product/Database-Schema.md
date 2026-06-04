---
tags:
  - agentscale
  - technical
---

# AgentScale — Database Schema

> Source of truth: `supabase/migrations/20240604000000_initial_schema.sql`

## Multi-tenancy model

- Every tenant table includes `organization_id`
- `organization_members` links users with roles: `org_admin`, `manager`, `viewer`
- RLS via helpers: `user_organization_ids()`, `can_write_org()`, `is_super_admin()`

## Enums

| Enum | Values |
|------|--------|
| `org_role` | org_admin, manager, viewer |
| `agent_status` | draft, onboarding, active, suspended, archived |
| `certification_status` | none, in_progress, certified, expired, revoked |
| `deployment_status` | development, staging, production |
| `risk_level` | low, medium, high, critical |
| `subscription_plan` | starter, growth, enterprise |
| `scenario_result` | pass, fail, pending |
| `audit_action` | create, update, delete, certify, revoke, deploy, prompt_change, model_change, rollback, approve, reject |

## Core tables

### Tenancy & users

```
organizations (id, name, slug, plan, agent_limit, stripe_*)
profiles (id → auth.users, email, full_name, is_super_admin)
organization_members (organization_id, user_id, role)
```

### Agent lifecycle

```
agents
  → registry: name, department, owner, status, model, prompt_version,
     risk_level, certification_status, deployment_status, health_score

agent_versions
  → prompt_content, model_*, is_current, version_label

agent_onboarding + onboarding_templates
```

### Training & testing

```
training_programs → training_modules
agent_training_progress

test_scenarios → scenario_runs (result, metrics, evaluated_at)
```

### Certifications & ops

```
certification_definitions → agent_certifications
performance_snapshots
incidents
audit_logs (entity_type, entity_id, action, actor_id, metadata)
```

## Module → table mapping

| Module | Primary tables |
|--------|----------------|
| Registry | `agents`, `agent_versions` |
| Onboarding | `agent_onboarding`, `onboarding_templates` |
| Academy | `training_programs`, `training_modules`, `agent_training_progress` |
| Scenarios | `test_scenarios`, `scenario_runs` |
| Certifications | `certification_definitions`, `agent_certifications` |
| Performance | `performance_snapshots` |
| Governance | `audit_logs` |
| Incidents | `incidents` |

## Security notes

- Never authorize from `user_metadata` alone
- Service role key **server-only** (webhooks, admin jobs)
- Contact form inserts via API route, not public anon without rate limits

## Related

- [[Features]]
- [[User-Stories]]
- Code: `docs/ARCHITECTURE.md`
