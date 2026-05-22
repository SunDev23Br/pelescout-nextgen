CREATE POLICY "chat peer profile read"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.iniciador_id = auth.uid() AND c.atleta_id = profiles.id)
       OR (c.atleta_id    = auth.uid() AND c.iniciador_id = profiles.id)
  )
);

CREATE POLICY "scouts read atleta profiles"
ON public.profiles
FOR SELECT
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'clube'))
  AND public.has_role(profiles.id, 'atleta')
);