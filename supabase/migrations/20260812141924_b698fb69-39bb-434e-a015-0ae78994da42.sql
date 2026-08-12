DROP POLICY IF EXISTS "scout_profiles public read" ON public.scout_profiles;

CREATE POLICY "scout_profiles authenticated read"
  ON public.scout_profiles FOR SELECT TO authenticated
  USING (true);

REVOKE SELECT ON public.scout_profiles FROM anon;