
-- 1. athlete_videos: require clube to have unlocked atleta
DROP POLICY IF EXISTS "athlete_videos read by scouts and chat peers" ON public.athlete_videos;
CREATE POLICY "athlete_videos read by scouts and chat peers"
ON public.athlete_videos FOR SELECT
USING (
  auth.uid() = atleta_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'suporte'::app_role)
  OR (public.has_role(auth.uid(), 'clube'::app_role) AND public.clube_has_unlocked_atleta(auth.uid(), atleta_id))
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.iniciador_id = auth.uid() AND c.atleta_id = athlete_videos.atleta_id)
       OR (c.atleta_id = auth.uid() AND c.iniciador_id = athlete_videos.atleta_id)
  )
);

-- 2. athlete-videos storage bucket: same gating
DROP POLICY IF EXISTS "athlete-videos restricted read" ON storage.objects;
CREATE POLICY "athlete-videos restricted read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'athlete-videos'
  AND auth.uid() IS NOT NULL
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
    OR (
      public.has_role(auth.uid(), 'clube'::app_role)
      AND public.clube_has_unlocked_atleta(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.atleta_id = ((storage.foldername(name))[1])::uuid
        AND (c.iniciador_id = auth.uid() OR c.atleta_id = auth.uid())
    )
  )
);

-- 3. conversations INSERT: clube must have unlocked atleta
DROP POLICY IF EXISTS "conv insert iniciador" ON public.conversations;
CREATE POLICY "conv insert iniciador"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = iniciador_id
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'clube'::app_role)
      AND public.clube_has_unlocked_atleta(auth.uid(), atleta_id)
    )
  )
);

-- 4. profiles "chat peer profile read": gate atleta profiles by unlock
DROP POLICY IF EXISTS "chat peer profile read" ON public.profiles;
CREATE POLICY "chat peer profile read"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.iniciador_id = auth.uid() AND c.atleta_id = profiles.id)
       OR (c.atleta_id = auth.uid() AND c.iniciador_id = profiles.id)
  )
  AND (
    -- peer is not an atleta: safe to read (e.g., atleta reading the clube/admin profile)
    NOT public.has_role(profiles.id, 'atleta'::app_role)
    -- or requester is admin/suporte
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
    -- or requester is a clube that has unlocked this atleta
    OR (
      public.has_role(auth.uid(), 'clube'::app_role)
      AND public.clube_has_unlocked_atleta(auth.uid(), profiles.id)
    )
  )
);

-- 5. user_roles: suporte must not be able to grant admin/suporte roles
DROP POLICY IF EXISTS "suporte manage roles" ON public.user_roles;
CREATE POLICY "suporte insert non-privileged roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'suporte'::app_role)
  AND role NOT IN ('admin'::app_role, 'suporte'::app_role)
);
CREATE POLICY "suporte update non-privileged roles"
ON public.user_roles FOR UPDATE
USING (
  public.has_role(auth.uid(), 'suporte'::app_role)
  AND role NOT IN ('admin'::app_role, 'suporte'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'suporte'::app_role)
  AND role NOT IN ('admin'::app_role, 'suporte'::app_role)
);
CREATE POLICY "suporte delete non-privileged roles"
ON public.user_roles FOR DELETE
USING (
  public.has_role(auth.uid(), 'suporte'::app_role)
  AND role NOT IN ('admin'::app_role, 'suporte'::app_role)
);
