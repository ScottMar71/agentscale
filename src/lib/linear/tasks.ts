export type LinearTask = {
  id: number;
  sprint: string;
  title: string;
  /** When set, sync script can apply this status on existing issues (MCP/manual review). */
  status?: "done" | "todo" | "in_progress" | "canceled";
};

/** AgentScale implementation plan — synced to Linear via `npm run linear:sync`. */
export const AGENTSCALE_LINEAR_TASKS: LinearTask[] = [
  { id: 1, sprint: "Sprint 1 — Auth & tenancy", title: "Enable Supabase Auth (email/password + magic link)" },
  { id: 2, sprint: "Sprint 1 — Auth & tenancy", title: "Add auth callback route for PKCE/magic link", status: "done" },
  { id: 3, sprint: "Sprint 1 — Auth & tenancy", title: "Server-side session in dashboard layout; redirect unauthenticated users" },
  { id: 4, sprint: "Sprint 1 — Auth & tenancy", title: "createOrganization server action + seed first member as org_admin" },
  { id: 5, sprint: "Sprint 1 — Auth & tenancy", title: "Org switcher in header (multi-org users)" },
  { id: 6, sprint: "Sprint 2 — Agent Registry", title: "Supabase agents data layer with demo fallback" },
  { id: 7, sprint: "Sprint 2 — Agent Registry", title: "Agent create/edit forms with Zod validation" },
  { id: 8, sprint: "Sprint 2 — Agent Registry", title: "Wire agent filters to URL search params" },
  { id: 9, sprint: "Sprint 2 — Agent Registry", title: "Audit log write on agent create/update" },
  { id: 10, sprint: "Sprint 3 — Onboarding & Academy", title: "CRUD training_programs / training_modules" },
  { id: 11, sprint: "Sprint 3 — Onboarding & Academy", title: "agent_onboarding progress API" },
  { id: 12, sprint: "Sprint 3 — Onboarding & Academy", title: "Module content upload to Supabase Storage" },
  { id: 13, sprint: "Sprint 3 — Onboarding & Academy", title: "Assign training programme to agent" },
  { id: 14, sprint: "Sprint 4 — Scenario engine", title: "Scenario CRUD UI" },
  { id: 15, sprint: "Sprint 4 — Scenario engine", title: "Run scenario UI (paste response or webhook)" },
  { id: 16, sprint: "Sprint 4 — Scenario engine", title: "Persist scenario_runs after /api/evaluate" },
  { id: 17, sprint: "Sprint 4 — Scenario engine", title: "Pass/fail gate for certification rules" },
  { id: 18, sprint: "Sprint 5 — Certifications & governance", title: "Certification request workflow + approver inbox" },
  { id: 19, sprint: "Sprint 5 — Certifications & governance", title: "Audit pack export (downloadable text report)", status: "done" },
  { id: 20, sprint: "Sprint 5 — Certifications & governance", title: "Auto-expire certs cron (Vercel Cron + service role)", status: "done" },
  { id: 21, sprint: "Sprint 5 — Certifications & governance", title: "Governance dashboard from live aggregates" },
  { id: 22, sprint: "Sprint 6 — Billing & production", title: "Stripe Customer Portal" },
  { id: 23, sprint: "Sprint 6 — Billing & production", title: "Enforce agent_limit on create" },
  { id: 24, sprint: "Sprint 6 — Billing & production", title: "Sentry + Vercel Analytics" },
  { id: 25, sprint: "Sprint 6 — Billing & production", title: "Playwright smoke tests" },
  { id: 26, sprint: "Sprint 7 — Pilot readiness", title: "Org invite flow (email + accept page)" },
  { id: 27, sprint: "Sprint 7 — Pilot readiness", title: "Role-based UI for Viewer role" },
  { id: 28, sprint: "Sprint 7 — Pilot readiness", title: "Live incidents module" },
  { id: 29, sprint: "Sprint 7 — Pilot readiness", title: "Resend org invite emails" },
  { id: 30, sprint: "Sprint 8 — Enterprise narrative", title: "Performance snapshots (import + webhook)" },
  { id: 31, sprint: "Sprint 8 — Enterprise narrative", title: "Version control + rollback" },
  { id: 32, sprint: "Sprint 8 — Enterprise narrative", title: "Incident reassessment workflow" },
  { id: 33, sprint: "Sprint 8 — Enterprise narrative", title: "PDF audit pack export", status: "done" },
  // Follow-up (post-implementation review 2026-06-05)
  { id: 35, sprint: "Sprint 9 — Pilot hardening", title: "Playwright E2E: landing → dashboard → agent detail", status: "done" },
  { id: 36, sprint: "Sprint 9 — Pilot hardening", title: "Production deploy verification (Vercel + Sentry DSN)", status: "done" },
  { id: 37, sprint: "Sprint 9 — Pilot hardening", title: "Provision E2E test user (provision:e2e-user)", status: "done" },
  // Milestone B — partner onboarding pre-flight (Q1)
  { id: 38, sprint: "Sprint 10 — Milestone B", title: "Add GitHub repo secrets for E2E CI (B1)" },
  { id: 39, sprint: "Sprint 10 — Milestone B", title: "Confirm Supabase redirect URLs (B3)" },
  { id: 40, sprint: "Sprint 10 — Milestone B", title: "Create Sentry alert rule for production (B5)" },
  { id: 41, sprint: "Sprint 10 — Milestone B", title: "Run verify:milestone-b — all green" },
  { id: 42, sprint: "Sprint 10 — Milestone B", title: "Update Features.md live vs demo status", status: "done" },
  { id: 43, sprint: "Sprint 10 — Milestone B", title: "Add MILESTONE_B.md partner support runbook", status: "done" },
  // Design partner programme (Q1 GTM Phase 1)
  { id: 44, sprint: "Sprint 11 — Design partners", title: "Write partner onboarding playbook", status: "done" },
  { id: 45, sprint: "Sprint 11 — Design partners", title: "Build pilot tenant seed script", status: "done" },
  { id: 46, sprint: "Sprint 11 — Design partners", title: "Add npm run seed:pilot script", status: "done" },
  { id: 47, sprint: "Sprint 11 — Design partners", title: "Partner success metrics view/dashboard widget", status: "done" },
  { id: 48, sprint: "Sprint 11 — Design partners", title: "Case study template doc", status: "done" },
  { id: 49, sprint: "Sprint 11 — Design partners", title: "Design partner outbound target list + outreach copy", status: "done" },
  { id: 50, sprint: "Sprint 11 — Design partners", title: "Homepage social proof section placeholder", status: "done" },
  // Q1 platform depth — Langfuse integration
  { id: 51, sprint: "Sprint 12 — Langfuse", title: "DB migration: performance_traces table + RLS" },
  { id: 52, sprint: "Sprint 12 — Langfuse", title: "Org settings: Langfuse API key storage" },
  { id: 53, sprint: "Sprint 12 — Langfuse", title: "Webhook endpoint /api/integrations/langfuse/webhook" },
  { id: 54, sprint: "Sprint 12 — Langfuse", title: "Performance UI: Langfuse-sourced metrics" },
  { id: 55, sprint: "Sprint 12 — Langfuse", title: "Cron: periodic Langfuse sync" },
  { id: 56, sprint: "Sprint 12 — Langfuse", title: "Docs: Langfuse setup guide" },
  { id: 57, sprint: "Sprint 12 — Langfuse", title: "E2E: performance page with mock trace" },
];
