-- AgentScale seed data (run after migration in dev)
INSERT INTO certification_definitions (id, name, slug, description, validity_days, is_global) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Sales Certified', 'sales', 'Qualified for sales operations', 365, true),
  ('c0000001-0000-0000-0000-000000000002', 'Support Certified', 'support', 'Customer support readiness', 365, true),
  ('c0000001-0000-0000-0000-000000000003', 'Compliance Certified', 'compliance', 'Regulatory compliance trained', 180, true),
  ('c0000001-0000-0000-0000-000000000004', 'Legal Review Certified', 'legal', 'Legal review qualified', 365, true),
  ('c0000001-0000-0000-0000-000000000005', 'GDPR Certified', 'gdpr', 'Data privacy compliant', 365, true)
ON CONFLICT DO NOTHING;

INSERT INTO onboarding_templates (id, name, items, is_global) VALUES
  ('t0000001-0000-0000-0000-000000000001', 'Standard Agent Onboarding', '[
    {"key":"prompt_uploaded","label":"Prompt uploaded"},
    {"key":"knowledge_base","label":"Knowledge base connected"},
    {"key":"security_review","label":"Security review completed"},
    {"key":"compliance_review","label":"Compliance review completed"},
    {"key":"test_scenarios","label":"Test scenarios passed"},
    {"key":"certification","label":"Certification completed"}
  ]'::jsonb, true)
ON CONFLICT DO NOTHING;
