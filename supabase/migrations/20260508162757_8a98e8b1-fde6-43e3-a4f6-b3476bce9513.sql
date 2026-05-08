CREATE POLICY "suporte manage peneiras"
ON public.peneiras
FOR ALL
USING (public.has_role(auth.uid(), 'suporte'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'suporte'::app_role));