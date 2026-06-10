import type { HelpTopic } from "@/lib/help/types";

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "metric.ai_workforce",
    title: "AI Workforce",
    category: "metric",
    summary: "Total registered agents in your organisation.",
    definition: "Counts every agent record scoped to the current organisation.",
    formula: "COUNT(agents) WHERE organization_id = current org",
    appearsOn: ["Executive Dashboard"],
    improveSteps: [
      { label: "Register an agent", href: "/dashboard/agents/new", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "metric.certified",
    title: "Certified",
    category: "metric",
    summary: "Agents with an active certification status.",
    definition:
      "Shows how many agents are certified and the certification coverage percentage.",
    formula:
      "COUNT(agents) WHERE certification_status = 'certified'; coverage = ROUND(certified ÷ total × 100)",
    appearsOn: ["Executive Dashboard", "Governance Centre"],
    improveSteps: [
      { label: "Request certifications", href: "/dashboard/certifications", roles: ["org_admin", "manager"] },
      { label: "Complete onboarding checklists", href: "/dashboard/onboarding", roles: ["org_admin", "manager"] },
    ],
    relatedIds: ["metric.expiring_certs"],
  },
  {
    id: "metric.utilisation",
    title: "Utilisation",
    category: "metric",
    summary: "Share of agents active and deployed to production.",
    formula:
      "ROUND(active_production ÷ total × 100) WHERE status = 'active' AND deployment_status = 'production'",
    appearsOn: ["Executive Dashboard"],
    improveSteps: [
      { label: "Review agent registry", href: "/dashboard/agents", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "metric.avg_health",
    title: "Avg Health",
    category: "metric",
    summary: "Mean health score across all agents (0–100 scale).",
    formula: "ROUND(SUM(health_score) ÷ total) per agent row",
    dataSource: "Updated when performance data is imported.",
    appearsOn: ["Executive Dashboard"],
    improveSteps: [
      { label: "Import performance data", href: "/dashboard/performance", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "metric.at_risk",
    title: "At Risk",
    category: "metric",
    summary: "Agents tagged with high or critical risk levels.",
    formula: "COUNT(agents) WHERE risk_level IN ('high', 'critical')",
    appearsOn: ["Executive Dashboard", "Governance Centre"],
    improveSteps: [
      { label: "Review high-risk agents", href: "/dashboard/agents", roles: ["org_admin", "manager"] },
      { label: "Log incidents", href: "/dashboard/incidents", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "metric.est_savings",
    title: "Est. Savings",
    category: "metric",
    summary: "Modelled annual cost savings from your AI workforce.",
    definition:
      "Live workspaces show a placeholder until Sprint 5+ modelling ships. Demo dashboard uses sample data.",
    appearsOn: ["Executive Dashboard"],
  },
  {
    id: "metric.expiring_certs",
    title: "Expiring certifications (30d)",
    category: "metric",
    summary: "Certifications expiring within the next 30 days.",
    formula:
      "COUNT(agent_certifications) WHERE status = 'certified' AND expires_at ≤ now + 30 days",
    appearsOn: ["Executive Dashboard", "Governance Centre"],
    improveSteps: [
      { label: "Review certifications", href: "/dashboard/certifications", roles: ["org_admin", "manager"] },
    ],
    relatedIds: ["metric.certified"],
  },
  {
    id: "metric.failed_assessments",
    title: "Failed assessments (7d)",
    category: "metric",
    summary: "Scenario runs that failed in the last 7 days.",
    formula:
      "COUNT(scenario_runs) WHERE result = 'fail' AND created_at ≥ 7 days ago",
    appearsOn: ["Executive Dashboard", "Governance Centre"],
    improveSteps: [
      { label: "Run scenario evaluations", href: "/dashboard/scenarios", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "metric.governance_posture",
    title: "Governance posture",
    category: "metric",
    summary: "Qualitative compliance health based on certification coverage.",
    definition:
      "Strong (≥80% coverage), Moderate (≥50%), Needs attention (<50%), or Not assessed when no agents exist.",
    appearsOn: ["Executive Dashboard", "Governance Centre"],
    improveSteps: [
      { label: "View governance centre", href: "/dashboard/governance" },
      { label: "Export audit pack", href: "/dashboard/governance", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "pilot.days_since_first_agent",
    title: "Days since first agent",
    category: "pilot",
    summary: "Calendar days since your organisation registered its first agent.",
    targets: "Target: register ≥10 agents in week 1 of the pilot.",
    appearsOn: ["Executive Dashboard — Pilot success metrics"],
    improveSteps: [
      { label: "Register agents", href: "/dashboard/agents/new", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "pilot.days_to_first_cert",
    title: "Days to first cert",
    category: "pilot",
    summary: "Days from first agent registration to first approved certification.",
    targets: "Target: under 14 days.",
    appearsOn: ["Executive Dashboard — Pilot success metrics"],
    improveSteps: [
      { label: "Request a certification", href: "/dashboard/certifications", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "pilot.avg_onboarding",
    title: "Avg onboarding",
    category: "pilot",
    summary: "Average checklist completion across agents in onboarding or draft status.",
    formula: "ROUND(completed_checklist_items ÷ 6 × 100) per agent, then averaged",
    targets: "Higher is better — aim for steady progress on all six checklist items.",
    appearsOn: ["Executive Dashboard — Pilot success metrics"],
    improveSteps: [
      { label: "Open onboarding board", href: "/dashboard/onboarding", roles: ["org_admin", "manager"] },
    ],
  },
  {
    id: "pilot.scenario_pass_rate",
    title: "Scenario pass rate",
    category: "pilot",
    summary: "Percentage of scenario runs that passed in the last 30 days.",
    formula: "ROUND(passed_runs ÷ total_runs × 100) for runs in last 30 days",
    targets: "Aim for consistent passes before requesting certifications.",
    appearsOn: ["Executive Dashboard — Pilot success metrics"],
    improveSteps: [
      { label: "Run scenarios", href: "/dashboard/scenarios", roles: ["org_admin", "manager"] },
    ],
  },
];

const topicMap = new Map(HELP_TOPICS.map((topic) => [topic.id, topic]));

export function getHelpTopic(id: string): HelpTopic | undefined {
  return topicMap.get(id);
}

export function searchHelpTopics(query: string): HelpTopic[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return HELP_TOPICS;

  return HELP_TOPICS.filter((topic) => {
    const haystack = [
      topic.title,
      topic.summary,
      topic.definition,
      topic.formula,
      topic.targets,
      ...(topic.appearsOn ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
