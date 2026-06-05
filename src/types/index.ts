export type OrgRole = "org_admin" | "manager" | "viewer";
export type AgentStatus = "draft" | "onboarding" | "active" | "suspended" | "archived";
export type CertificationStatus = "none" | "in_progress" | "certified" | "expired" | "revoked";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type DeploymentStatus = "development" | "staging" | "production";

export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  department: string | null;
  business_function: string | null;
  owner_id: string | null;
  owner_name?: string;
  status: AgentStatus;
  model_provider: string | null;
  model_version: string | null;
  prompt_version: string | null;
  tool_stack: string[];
  knowledge_base_connected: boolean;
  risk_level: RiskLevel;
  certification_status: CertificationStatus;
  deployment_status: DeploymentStatus;
  health_score: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingProgram {
  id: string;
  organization_id?: string;
  title: string;
  description: string | null;
  certification_type: string | null;
  module_count: number;
  is_published: boolean;
}

export interface TrainingModule {
  id: string;
  program_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  content: {
    body?: string;
    storage_path?: string;
    file_name?: string;
    mime_type?: string;
  };
}

export interface TrainingProgramDetail extends TrainingProgram {
  modules: TrainingModule[];
}

export interface AgentTrainingAssignment {
  id: string;
  agent_id: string;
  agent_name: string;
  program_id: string;
  program_title: string;
  modules_completed: number;
  total_modules: number;
  percent_complete: number;
}

export interface TestScenario {
  id: string;
  organization_id?: string;
  name: string;
  prompt: string;
  expected_behaviour: string | null;
  pass_criteria: Record<string, unknown>;
  is_published?: boolean;
  run_count?: number;
}

export interface ScenarioRun {
  id: string;
  scenario_id: string;
  scenario_name?: string;
  agent_id: string;
  agent_name?: string;
  score: number | null;
  result: "pass" | "fail" | "pending";
  metrics: Record<string, number>;
  evaluation_summary: string | null;
  created_at: string;
}

export interface Certification {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  validity_days: number;
}

export interface AgentCertification {
  id: string;
  agent_id: string;
  agent_name: string;
  certification_name: string;
  status: CertificationStatus;
  earned_at: string | null;
  expires_at: string | null;
  certificate_number: string | null;
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  action: string;
  actor_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Incident {
  id: string;
  agent_id: string;
  agent_name: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  root_cause: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalAgents: number;
  certifiedAgents: number;
  expiringCerts: number;
  failedAssessments: number;
  highRiskAgents: number;
  avgHealthScore: number;
  utilization: number;
  estimatedSavings: number;
}

export interface OnboardingRecord {
  id?: string;
  agent_id: string;
  agent_name: string;
  progress_percent: number;
  checklist: { key: string; label: string; completed: boolean }[];
  completed_at?: string | null;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version_label: string;
  is_current: boolean;
  model_provider: string | null;
  created_at: string;
}
