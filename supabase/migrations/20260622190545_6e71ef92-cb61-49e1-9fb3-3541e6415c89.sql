
CREATE OR REPLACE FUNCTION public.list_atletas_aprovados()
RETURNS TABLE(
  candidato_id uuid,
  user_id uuid,
  nome text,
  posicao text,
  cidade text,
  data_nascimento date,
  avatar_url text,
  nota_geral numeric,
  peneira_titulo text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'clube'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
  ) THEN
    RAISE EXCEPTION 'Acesso restrito a clubes, admin ou suporte';
  END IF;

  RETURN QUERY
  WITH cand_aprov AS (
    SELECT
      c.id AS candidato_id,
      c.user_id,
      COALESCE(p.nome, c.nome)::text AS nome,
      COALESCE(p.posicao::text, c.posicao::text) AS posicao,
      COALESCE(p.cidade, c.cidade)::text AS cidade,
      COALESCE(p.data_nascimento, c.data_nascimento) AS data_nascimento,
      COALESCE(p.avatar_url, c.avatar)::text AS avatar_url,
      c.nota_geral::numeric AS nota_geral,
      pn.titulo::text AS peneira_titulo
    FROM public.candidatos c
    LEFT JOIN public.profiles p ON p.id = c.user_id
    LEFT JOIN public.peneiras pn ON pn.id = c.peneira_id
    WHERE c.status = 'aprovado'::status_candidato
      AND c.user_id IS NOT NULL
  ),
  aval_aprov AS (
    SELECT DISTINCT ON (a.atleta_user_id)
      a.atleta_user_id AS user_id,
      a.nota_geral::numeric AS nota_geral,
      a.created_at
    FROM public.avaliacoes a
    WHERE a.decisao = 'aprovado'
      AND a.atleta_user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM cand_aprov ca WHERE ca.user_id = a.atleta_user_id
      )
    ORDER BY a.atleta_user_id, a.created_at DESC
  )
  SELECT * FROM cand_aprov
  UNION ALL
  SELECT
    aa.user_id AS candidato_id,
    aa.user_id,
    COALESCE(p.nome, 'Atleta')::text AS nome,
    COALESCE(p.posicao::text, 'Meia') AS posicao,
    COALESCE(p.cidade, '—')::text AS cidade,
    COALESCE(p.data_nascimento, DATE '2000-01-01') AS data_nascimento,
    p.avatar_url::text,
    aa.nota_geral,
    NULL::text AS peneira_titulo
  FROM aval_aprov aa
  LEFT JOIN public.profiles p ON p.id = aa.user_id
  WHERE p.id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_atletas_aprovados() TO authenticated;
