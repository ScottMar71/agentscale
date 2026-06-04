-- Training module content bucket (private, org-scoped paths)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-content',
  'training-content',
  false,
  10485760,
  ARRAY['application/pdf', 'text/plain', 'text/markdown', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY training_content_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'training-content'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY training_content_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'training-content'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY training_content_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'training-content'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY training_content_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'training-content'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );
