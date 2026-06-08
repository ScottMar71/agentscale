-- Revoke direct RPC access to helper SECURITY DEFINER functions from PUBLIC/anon.
-- Note: authenticated must retain EXECUTE — RLS policies call these functions and
-- PostgreSQL requires EXECUTE on the invoker. See fix_rls_helper_grants migration.

REVOKE ALL ON FUNCTION public.user_organization_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_org_role(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_write_org(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.user_organization_ids() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_org_role(UUID) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_write_org(UUID) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.create_organization(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;

-- Trigger helper: fixed search_path
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Contact form uses Resend API only; block open anon inserts
DROP POLICY IF EXISTS contact_insert ON contact_requests;
