-- Organization invites for team onboarding
CREATE TABLE organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE INDEX idx_org_invites_token ON organization_invites(token);
CREATE INDEX idx_org_invites_org ON organization_invites(organization_id);

ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_invites_select ON organization_invites FOR SELECT
  USING (
    organization_id IN (SELECT public.user_organization_ids())
    OR public.is_super_admin()
  );

CREATE POLICY org_invites_manage ON organization_invites FOR ALL
  USING (public.user_org_role(organization_id) = 'org_admin' OR public.is_super_admin())
  WITH CHECK (public.user_org_role(organization_id) = 'org_admin' OR public.is_super_admin());

-- Accept invite: validates token, email match, and creates membership
CREATE OR REPLACE FUNCTION public.accept_organization_invite(invite_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  invite_row organization_invites%ROWTYPE;
  user_email TEXT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found';
  END IF;

  SELECT * INTO invite_row
  FROM organization_invites
  WHERE token = invite_token
    AND accepted_at IS NULL
    AND expires_at > now()
  FOR UPDATE;

  IF invite_row.id IS NULL THEN
    RAISE EXCEPTION 'Invite not found or expired';
  END IF;

  IF lower(trim(invite_row.email)) <> lower(trim(user_email)) THEN
    RAISE EXCEPTION 'This invite was sent to a different email address';
  END IF;

  IF EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = invite_row.organization_id AND user_id = uid
  ) THEN
    UPDATE organization_invites
    SET accepted_at = now()
    WHERE id = invite_row.id;
    RETURN invite_row.organization_id;
  END IF;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (invite_row.organization_id, uid, invite_row.role);

  UPDATE organization_invites
  SET accepted_at = now()
  WHERE id = invite_row.id;

  RETURN invite_row.organization_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_organization_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_organization_invite(TEXT) TO authenticated;
