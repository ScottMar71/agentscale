export const APP_NAME = "AgentScale";
export const APP_TAGLINE = "The System of Record for AI Workers";

export const PLANS = {
  starter: { name: "Starter", agents: 10, price: 299, priceLabel: "£299/mo" },
  growth: { name: "Growth", agents: 100, price: 999, priceLabel: "£999/mo" },
  enterprise: { name: "Enterprise", agents: -1, price: 0, priceLabel: "Custom" },
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Executive", icon: "LayoutDashboard" },
  { href: "/dashboard/agents", label: "Agent Registry", icon: "Bot" },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: "ClipboardCheck" },
  { href: "/dashboard/academy", label: "Training Academy", icon: "GraduationCap" },
  { href: "/dashboard/scenarios", label: "Scenario Testing", icon: "FlaskConical" },
  { href: "/dashboard/certifications", label: "Certifications", icon: "Award" },
  { href: "/dashboard/performance", label: "Performance", icon: "BarChart3" },
  { href: "/dashboard/governance", label: "Governance", icon: "Shield" },
  { href: "/dashboard/versions", label: "Version Control", icon: "GitBranch" },
  { href: "/dashboard/incidents", label: "Improvement", icon: "RefreshCw" },
] as const;

export type NavIconName = (typeof NAV_ITEMS)[number]["icon"];

export const ONBOARDING_CHECKLIST = [
  { key: "prompt_uploaded", label: "Prompt uploaded" },
  { key: "knowledge_base", label: "Knowledge base connected" },
  { key: "security_review", label: "Security review completed" },
  { key: "compliance_review", label: "Compliance review completed" },
  { key: "test_scenarios", label: "Test scenarios passed" },
  { key: "certification", label: "Certification completed" },
] as const;

export const CERTIFICATION_TYPES = [
  "Sales Certified",
  "Support Certified",
  "Compliance Certified",
  "Legal Review Certified",
  "GDPR Certified",
] as const;
