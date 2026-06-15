CREATE POLICY "conv delete iniciador or admin"
ON public.conversations
FOR DELETE
TO authenticated
USING (
  auth.uid() = iniciador_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'suporte'::app_role)
);