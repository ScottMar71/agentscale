-- Allow authenticated users to create their first organization (bootstrap tenant).
CREATE OR REPLACE FUNCTION public.create_organization(
  org_name TEXT,
  org_slug TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  uid UUID := auth.uid();
  normalized_slug TEXT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  normalized_slug := lower(trim(org_slug));
  IF normalized_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Invalid organization slug';
  END IF;

  IF length(trim(org_name)) < 2 THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  INSERT INTO organizations (name, slug)
  VALUES (trim(org_name), normalized_slug)
  RETURNING id INTO new_org_id;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, uid, 'org_admin');

  RETURN new_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;
