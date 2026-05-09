CREATE POLICY "clube create own peneiras"
ON public.peneiras
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by);

CREATE POLICY "clube manage own peneiras"
ON public.peneiras
FOR UPDATE
USING (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by)
WITH CHECK (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by);

CREATE POLICY "clube delete own peneiras"
ON public.peneiras
FOR DELETE
USING (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by);