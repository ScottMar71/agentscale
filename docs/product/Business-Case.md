---
tags:
  - agentscale
  - business
---

# AgentScale — Business Case

## Market opportunity

Organisations are moving from **chatbots** to **autonomous agents** with tools, memory, and production access. Workforce management categories (HRIS, LMS, GRC) do not map cleanly to AI workers — creating a new **AI Workforce Management** category.

## Customer pain (validated hypotheses)

1. **Visibility** — "How many agents do we have, and who owns them?"
2. **Risk** — "Can we prove this agent was tested before prod?"
3. **Change control** — "Who changed the prompt last Tuesday?"
4. **Scale** — "We need the same onboarding for agent #50 as #5."

## Value proposition

| Stakeholder | Value |
|-------------|-------|
| CISO / Compliance | Audit-ready certification and governance |
| Head of AI | Single registry + scenario testing |
| LOB leaders | Faster, safer agent rollout |
| Finance | Plan limits, agent caps, usage alignment |

## Revenue model

| Plan | Positioning |
|------|-------------|
| **Starter** | Small teams, agent limit (~10) |
| **Growth** | Multiple departments, higher limits |
| **Enterprise** | SSO, custom compliance, SLA |

Billing via **Stripe** (checkout + webhook → `organizations.plan`).

## Go-to-market (initial)

- **Design partners** — 3–5 regulated / high-volume agent orgs (Q1)
- **Demo-led sales** — landing + `/api/contact` → Resend
- **Category narrative** — "System of Record for AI Workers"

## Success metrics (12 months)

- 5+ paying orgs on Growth or Enterprise
- Median time-to-certification &lt; 14 days
- 90%+ of prod agents with valid certification record
- NPS ≥ 40 from platform admins

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Compete with observability (Langfuse) | Integrate, don't replace — AgentScale owns lifecycle |
| Long enterprise sales | MVP pilot in 8–12 weeks; design partners |
| AI eval cost | Cached rubrics, batch runs, plan limits |

## Related

- [[Vision]]
- [[Features]]
- [[Marketing-Plan]]
- [[Investor-Deck]]
