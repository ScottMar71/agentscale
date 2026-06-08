-- Restore EXECUTE on RLS helper functions for the authenticated role.
-- harden_function_grants revoked these to block direct RPC calls, but PostgreSQL
-- still requires EXECUTE when RLS policies invoke these functions. Without this
-- grant, org creation succeeds but users cannot read their memberships (stuck on /setup).

GRANT EXECUTE ON FUNCTION public.user_organization_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_org_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_org(UUID) TO authenticated;
