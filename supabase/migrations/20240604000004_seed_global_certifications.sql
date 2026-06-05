-- Global certification templates (idempotent)
INSERT INTO certification_definitions (id, name, slug, description, validity_days, is_global, rules) VALUES
  (
    'c0000001-0000-0000-0000-000000000001',
    'Sales Certified',
    'sales',
    'Qualified for sales operations',
    365,
    true,
    '{"min_scenario_passes":1,"require_onboarding_complete":true}'::jsonb
  ),
  (
    'c0000001-0000-0000-0000-000000000002',
    'Support Certified',
    'support',
    'Customer support readiness',
    365,
    true,
    '{"min_scenario_passes":1,"require_onboarding_complete":true}'::jsonb
  ),
  (
    'c0000001-0000-0000-0000-000000000003',
    'Compliance Certified',
    'compliance',
    'Regulatory compliance trained',
    180,
    true,
    '{"min_scenario_passes":2,"require_onboarding_complete":true}'::jsonb
  ),
  (
    'c0000001-0000-0000-0000-000000000004',
    'Legal Review Certified',
    'legal',
    'Legal review qualified',
    365,
    true,
    '{"min_scenario_passes":1,"require_onboarding_complete":true}'::jsonb
  ),
  (
    'c0000001-0000-0000-0000-000000000005',
    'GDPR Certified',
    'gdpr',
    'Data privacy compliant',
    365,
    true,
    '{"min_scenario_passes":1,"require_onboarding_complete":true}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
