---
tags:
  - agentscale
  - requirements
---

# AgentScale — User Stories

## Personas

- **Org Admin** — manages org, billing, invites
- **Manager** — registers agents, runs scenarios, requests certs
- **Viewer** — read-only dashboards and reports
- **Super Admin** — platform-wide org and template management

---

## Epic: Authentication & tenancy

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| AUTH-1 | As a new user, I sign up with email so I can access the dashboard | Email/password or magic link; session in layout |
| AUTH-2 | As an org admin, I create an organization so my team has a tenant | `createOrganization` action; creator is `org_admin` |
| AUTH-3 | As a user in multiple orgs, I switch org context so I see the right data | Org switcher; RLS scoped to selected org |

## Epic: Agent Registry

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| REG-1 | As a manager, I register a new agent so it appears in the inventory | Required fields validated (Zod); audit log on create |
| REG-2 | As a manager, I filter agents by status/department so I find agents quickly | Filters sync to URL search params |
| REG-3 | As a viewer, I view agent detail without edit actions | RBAC hides write UI |

## Epic: Onboarding & Academy

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| ONB-1 | As a manager, I assign an onboarding checklist to an agent | Progress % updates on item completion |
| ACAD-1 | As a manager, I assign a training programme | `agent_training_progress` reflects module completion |

## Epic: Scenario testing

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| SCEN-1 | As a manager, I run a scenario against an agent response | `/api/evaluate` returns rubric score; run saved |
| SCEN-2 | As compliance, I require pass on scenarios before certification | Cert engine checks `scenario_runs` rules |

## Epic: Certifications

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| CERT-1 | As a manager, I request certification for an agent | Request enters approver inbox |
| CERT-2 | As an org admin, I approve certification | Status → certified; audit entry |

## Epic: Governance

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| GOV-1 | As compliance, I see who changed a prompt and when | `audit_logs` with `prompt_change` action |
| GOV-2 | As an exec, I view governance dashboard aggregates | Live counts from DB |

## Epic: Billing

| ID | Story | Acceptance criteria |
|----|-------|---------------------|
| BILL-1 | As an org admin, I upgrade plan via Stripe | Webhook updates `organizations.plan` |
| BILL-2 | As a manager, I cannot exceed agent limit on Starter | Create blocked with clear message |

## MVP definition of done

1. User signs up, creates org, invites team.
2. User registers agent, completes onboarding.
3. User runs scenario, receives AI score.
4. User requests certification; admin approves.
5. Audit log shows prompt change with actor.
6. Executive dashboard reflects live org data.

## Related

- [[Features]]
- [[Database-Schema]]
- [[Vision]]
