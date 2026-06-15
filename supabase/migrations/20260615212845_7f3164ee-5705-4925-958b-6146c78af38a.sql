
ALTER TABLE public.admin_requests
  ADD COLUMN IF NOT EXISTS celular text,
  ADD COLUMN IF NOT EXISTS idade integer,
  ADD COLUMN IF NOT EXISTS clube_atual text,
  ADD COLUMN IF NOT EXISTS rg_frente_path text,
  ADD COLUMN IF NOT EXISTS rg_verso_path text;

ALTER TABLE public.admin_requests
  DROP CONSTRAINT IF EXISTS admin_requests_idade_check;
ALTER TABLE public.admin_requests
  ADD CONSTRAINT admin_requests_idade_check CHECK (idade IS NULL OR (idade BETWEEN 18 AND 99));

-- Storage policies for admin-docs bucket
CREATE POLICY "admin-docs owner insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "admin-docs owner update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'admin-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "admin-docs owner or suporte read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-docs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'suporte')
  )
);

CREATE POLICY "admin-docs suporte delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-docs'
  AND public.has_role(auth.uid(), 'suporte')
);
