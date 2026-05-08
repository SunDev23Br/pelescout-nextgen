CREATE POLICY "suporte manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'suporte'::app_role))
WITH CHECK (has_role(auth.uid(), 'suporte'::app_role));