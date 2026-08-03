DROP POLICY IF EXISTS "clube own contatos insert" ON public.contatos_desbloqueados;
REVOKE INSERT, UPDATE, DELETE ON public.contatos_desbloqueados FROM authenticated;
GRANT SELECT ON public.contatos_desbloqueados TO authenticated;
GRANT ALL ON public.contatos_desbloqueados TO service_role;