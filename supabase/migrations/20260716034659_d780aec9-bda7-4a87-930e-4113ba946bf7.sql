DROP POLICY IF EXISTS "chat peer profile read" ON public.profiles;

CREATE POLICY "chat peer profile read" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.iniciador_id = auth.uid() AND c.atleta_id = profiles.id)
       OR (c.atleta_id = auth.uid() AND c.iniciador_id = profiles.id)
  )
  AND (
    public.has_role(profiles.id, 'admin'::app_role)
    OR public.has_role(profiles.id, 'clube'::app_role)
    OR public.has_role(profiles.id, 'suporte'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
    OR (public.has_role(auth.uid(), 'clube'::app_role) AND public.clube_has_unlocked_atleta(auth.uid(), profiles.id))
  )
);