
-- 1. Fix privilege escalation: ignore client-supplied role at signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, nome_clube, cnpj)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'nome_clube',
    NEW.raw_user_meta_data->>'cnpj'
  );

  -- Always assign 'atleta'. Elevated roles (clube, admin) must be granted by an admin via the support panel.
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'atleta');

  RETURN NEW;
END $$;

-- 2. Restrict clube reads on candidatos to unlocked contacts only
DROP POLICY IF EXISTS "candidato own read" ON public.candidatos;
CREATE POLICY "candidato own read" ON public.candidatos
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'clube'::app_role)
    AND status = 'aprovado'::status_candidato
    AND EXISTS (
      SELECT 1 FROM public.contatos_desbloqueados cd
      WHERE cd.clube_id = auth.uid() AND cd.candidato_id = candidatos.id
    )
  )
);

-- 3. Restrict clube reads on avaliacoes to unlocked candidates only
DROP POLICY IF EXISTS "avaliacoes read" ON public.avaliacoes;
CREATE POLICY "avaliacoes read" ON public.avaliacoes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.candidatos c
    WHERE c.id = avaliacoes.candidato_id AND c.user_id = auth.uid()
  )
  OR (
    has_role(auth.uid(), 'clube'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.contatos_desbloqueados cd
      WHERE cd.clube_id = auth.uid() AND cd.candidato_id = avaliacoes.candidato_id
    )
  )
);

-- 4. Revoke execute on internal SECURITY DEFINER function from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
