-- AgentScale: Multi-tenant AI Workforce Management Platform
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE org_role AS ENUM ('org_admin', 'manager', 'viewer');
CREATE TYPE agent_status AS ENUM ('draft', 'onboarding', 'active', 'suspended', 'archived');
CREATE TYPE certification_status AS ENUM ('none', 'in_progress', 'certified', 'expired', 'revoked');
CREATE TYPE deployment_status AS ENUM ('development', 'staging', 'production');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE scenario_result AS ENUM ('pass', 'fail', 'pending');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'certify', 'revoke', 'deploy',
  'prompt_change', 'model_change', 'rollback', 'approve', 'reject'
);

-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'starter',
  agent_limit INTEGER NOT NULL DEFAULT 10,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization membership
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- Agent Registry
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  business_function TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status agent_status NOT NULL DEFAULT 'draft',
  model_provider TEXT,
  model_version TEXT,
  prompt_version TEXT DEFAULT '1.0.0',
  tool_stack JSONB DEFAULT '[]'::jsonb,
  knowledge_base_connected BOOLEAN DEFAULT false,
  risk_level risk_level NOT NULL DEFAULT 'medium',
  certification_status certification_status NOT NULL DEFAULT 'none',
  deployment_status deployment_status NOT NULL DEFAULT 'development',
  health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agents_org ON agents(organization_id);
CREATE INDEX idx_agents_status ON agents(organization_id, status);

-- Agent version control
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  prompt_content TEXT,
  model_provider TEXT,
  model_version TEXT,
  knowledge_base_version TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding checklists
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training Academy
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  certification_type TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  modules_completed INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  percent_complete INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, program_id)
);

-- Scenario Testing Engine
CREATE TABLE test_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  expected_behaviour TEXT,
  pass_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scenario_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES test_scenarios(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  result scenario_result NOT NULL DEFAULT 'pending',
  metrics JSONB DEFAULT '{}'::jsonb,
  evaluation_summary TEXT,
  run_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certifications
CREATE TABLE certification_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  validity_days INTEGER DEFAULT 365,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES certification_definitions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status certification_status NOT NULL DEFAULT 'in_progress',
  earned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  certificate_number TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, certification_id)
);

-- Performance metrics
CREATE TABLE performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  accuracy NUMERIC(5,2),
  success_rate NUMERIC(5,2),
  escalation_rate NUMERIC(5,2),
  error_rate NUMERIC(5,2),
  hallucination_rate NUMERIC(5,2),
  user_satisfaction NUMERIC(5,2),
  cost_per_task NUMERIC(12,4),
  avg_response_time_ms INTEGER,
  health_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Governance & audit
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action audit_action NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);

-- Continuous improvement / incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity incident_severity NOT NULL DEFAULT 'medium',
  root_cause TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  remediation JSONB DEFAULT '[]'::jsonb,
  reported_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact / demo requests
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  type TEXT DEFAULT 'demo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper: user's org IDs
CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_org_role(org_id UUID)
RETURNS org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM organization_members
  WHERE user_id = auth.uid() AND organization_id = org_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_super_admin FROM profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.can_write_org(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin()
    OR public.user_org_role(org_id) IN ('org_admin', 'manager');
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Organizations
CREATE POLICY org_select ON organizations FOR SELECT
  USING (id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY org_insert ON organizations FOR INSERT
  WITH CHECK (public.is_super_admin());
CREATE POLICY org_update ON organizations FOR UPDATE
  USING (public.is_super_admin() OR public.user_org_role(id) = 'org_admin');

-- Organization members
CREATE POLICY org_members_select ON organization_members FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY org_members_manage ON organization_members FOR ALL
  USING (public.user_org_role(organization_id) = 'org_admin' OR public.is_super_admin());

-- Agents
CREATE POLICY agents_select ON agents FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY agents_insert ON agents FOR INSERT
  WITH CHECK (public.can_write_org(organization_id));
CREATE POLICY agents_update ON agents FOR UPDATE
  USING (public.can_write_org(organization_id));
CREATE POLICY agents_delete ON agents FOR DELETE
  USING (public.user_org_role(organization_id) = 'org_admin' OR public.is_super_admin());

-- Agent versions
CREATE POLICY agent_versions_all ON agent_versions FOR ALL
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id));

-- Onboarding
CREATE POLICY onboarding_templates_select ON onboarding_templates FOR SELECT
  USING (organization_id IS NULL OR organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY agent_onboarding_all ON agent_onboarding FOR ALL
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id));

-- Training
CREATE POLICY training_programs_select ON training_programs FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY training_programs_write ON training_programs FOR ALL
  USING (public.can_write_org(organization_id) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id) OR public.is_super_admin());

CREATE POLICY training_modules_select ON training_modules FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY training_modules_write ON training_modules FOR ALL
  USING (public.can_write_org(organization_id) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id) OR public.is_super_admin());

CREATE POLICY agent_training_progress_all ON agent_training_progress FOR ALL
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id));

-- Scenarios
CREATE POLICY test_scenarios_select ON test_scenarios FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY test_scenarios_write ON test_scenarios FOR ALL
  USING (public.can_write_org(organization_id) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id) OR public.is_super_admin());

CREATE POLICY scenario_runs_select ON scenario_runs FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY scenario_runs_write ON scenario_runs FOR ALL
  USING (public.can_write_org(organization_id) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id) OR public.is_super_admin());

-- Certifications
CREATE POLICY cert_defs_select ON certification_definitions FOR SELECT
  USING (organization_id IS NULL OR organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY agent_certs_all ON agent_certifications FOR ALL
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id) OR public.user_org_role(organization_id) = 'org_admin');

-- Performance
CREATE POLICY performance_select ON performance_snapshots FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY performance_write ON performance_snapshots FOR INSERT
  WITH CHECK (public.can_write_org(organization_id));

-- Audit logs (read org, write system)
CREATE POLICY audit_select ON audit_logs FOR SELECT
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin());
CREATE POLICY audit_insert ON audit_logs FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

-- Incidents
CREATE POLICY incidents_all ON incidents FOR ALL
  USING (organization_id IN (SELECT public.user_organization_ids()) OR public.is_super_admin())
  WITH CHECK (public.can_write_org(organization_id));

-- Contact (public insert via service role only - anon blocked)
CREATE POLICY contact_insert ON contact_requests FOR INSERT
  WITH CHECK (true);
CREATE POLICY contact_select ON contact_requests FOR SELECT
  USING (public.is_super_admin());

-- Seed global certification templates (run after migration)
COMMENT ON TABLE organizations IS 'AgentScale multi-tenant organizations';
