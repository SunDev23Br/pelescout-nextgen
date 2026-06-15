CREATE POLICY "clubes leem avaliacoes aprovadas" ON public.avaliacoes
FOR SELECT
TO authenticated
USING (
  decisao = 'aprovado'
  AND atleta_user_id IS NOT NULL
  AND has_role(auth.uid(), 'clube')
);