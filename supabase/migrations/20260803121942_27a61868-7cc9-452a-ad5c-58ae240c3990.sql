CREATE OR REPLACE FUNCTION public.get_olheiro_public_stats(_scout uuid)
RETURNS TABLE(observados integer, avaliacoes integer, indicacoes integer, aprovados integer, media numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT (
    auth.uid() = _scout
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
    OR public.users_share_conversation(auth.uid(), _scout)
  ) THEN
    RAISE EXCEPTION 'Sem permissão para ver as estatísticas deste olheiro';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(DISTINCT a.candidato_id)::int AS observados,
    COUNT(*)::int AS avaliacoes,
    COUNT(*) FILTER (WHERE a.decisao IN ('aprovado','aprovar'))::int AS indicacoes,
    (SELECT COUNT(*)::int FROM public.candidatos c WHERE c.status = 'aprovado'::status_candidato) AS aprovados,
    ROUND(AVG(NULLIF(a.nota_geral, 0)), 2) AS media
  FROM public.avaliacoes a
  WHERE a.avaliador_id = _scout;
END $$;

GRANT EXECUTE ON FUNCTION public.get_olheiro_public_stats(uuid) TO authenticated;