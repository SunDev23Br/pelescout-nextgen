
-- 1) athlete_videos: remove the conversation-based bypass
DROP POLICY IF EXISTS "athlete_videos read by scouts and chat peers" ON public.athlete_videos;

CREATE POLICY "athlete_videos read by owner and unlocked"
  ON public.athlete_videos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = atleta_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
    OR (
      public.has_role(auth.uid(), 'clube'::app_role)
      AND public.clube_has_unlocked_atleta(auth.uid(), atleta_id)
    )
  );

-- 1b) Storage bucket 'athlete-videos': mirror the same restriction
DROP POLICY IF EXISTS "athlete-videos restricted read" ON storage.objects;

CREATE POLICY "athlete-videos restricted read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'athlete-videos'
    AND auth.uid() IS NOT NULL
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'suporte'::app_role)
      OR (
        public.has_role(auth.uid(), 'clube'::app_role)
        AND public.clube_has_unlocked_atleta(
          auth.uid(),
          ((storage.foldername(name))[1])::uuid
        )
      )
    )
  );

-- 2) candidatos: remove the direct clube read branch so PII (email, celular,
--    data_nascimento) is never exposed via the table to clubs. Clubs use the
--    SECURITY DEFINER RPC `list_atletas_aprovados()` for safe fields and
--    read contact info from `profiles` only after unlock.
DROP POLICY IF EXISTS "candidato own read" ON public.candidatos;

CREATE POLICY "candidato own read"
  ON public.candidatos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
  );

-- 3) user_roles: prevent suporte from reassigning a role row to another user
--    by changing user_id. Only admin may change user_id on an existing row.
CREATE OR REPLACE FUNCTION public.tg_user_roles_lock_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Alteração de user_id em user_roles não é permitida para este papel';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_lock_user_id ON public.user_roles;
CREATE TRIGGER user_roles_lock_user_id
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_user_roles_lock_user_id();
