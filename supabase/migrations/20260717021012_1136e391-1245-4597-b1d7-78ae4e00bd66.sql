
-- Public read of a curated athlete profile (safe columns only), for shareable /a/:id
CREATE OR REPLACE FUNCTION public.get_public_atleta(_id uuid)
RETURNS TABLE(
  id uuid,
  nome text,
  avatar_url text,
  posicao text,
  cidade text,
  altura integer,
  peso integer,
  pe text,
  data_nascimento date,
  bio text,
  skills jsonb,
  skills_validated jsonb,
  skills_validated_at timestamptz,
  historico_clubes jsonb,
  stats jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.nome, p.avatar_url, p.posicao::text, p.cidade, p.altura, p.peso, p.pe::text,
         p.data_nascimento, p.bio, p.skills, p.skills_validated, p.skills_validated_at,
         p.historico_clubes, p.stats
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'atleta'::app_role
  WHERE p.id = _id;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_atleta(uuid) TO anon, authenticated;

-- Skill history with validator name
CREATE OR REPLACE FUNCTION public.get_athlete_skill_history(_atleta uuid)
RETURNS TABLE(
  id uuid,
  created_at timestamptz,
  source text,
  validator_id uuid,
  validator_name text,
  skills jsonb
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    auth.uid() = _atleta
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
    OR public.has_role(auth.uid(), 'clube'::app_role)
  ) THEN
    RAISE EXCEPTION 'Sem permissão para ver o histórico deste atleta';
  END IF;

  RETURN QUERY
  SELECT h.id, h.created_at, h.source::text, h.validator_id,
         COALESCE(pv.nome, NULL)::text AS validator_name,
         h.skills
  FROM public.athlete_skill_history h
  LEFT JOIN public.profiles pv ON pv.id = h.validator_id
  WHERE h.atleta_id = _atleta
  ORDER BY h.created_at ASC;
END $$;
GRANT EXECUTE ON FUNCTION public.get_athlete_skill_history(uuid) TO authenticated;

-- Advanced athlete search for scouts / clubs
CREATE OR REPLACE FUNCTION public.search_public_atletas(
  _posicao text DEFAULT NULL,
  _cidade text DEFAULT NULL,
  _idade_min integer DEFAULT NULL,
  _idade_max integer DEFAULT NULL,
  _skill text DEFAULT NULL,
  _skill_min integer DEFAULT NULL,
  _only_validated boolean DEFAULT false,
  _limit integer DEFAULT 60
)
RETURNS TABLE(
  id uuid,
  nome text,
  avatar_url text,
  posicao text,
  cidade text,
  data_nascimento date,
  skills jsonb,
  skills_validated jsonb,
  is_validated boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _lim int := LEAST(GREATEST(COALESCE(_limit, 60), 1), 200);
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'clube'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
  ) THEN
    RAISE EXCEPTION 'Acesso restrito a clubes, admin ou suporte';
  END IF;

  RETURN QUERY
  SELECT p.id, p.nome, p.avatar_url, p.posicao::text, p.cidade, p.data_nascimento,
         p.skills, p.skills_validated,
         (p.skills_validated IS NOT NULL AND p.skills_validated <> '{}'::jsonb) AS is_validated
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'atleta'::app_role
  WHERE
    (_posicao IS NULL OR p.posicao::text = _posicao)
    AND (_cidade IS NULL OR p.cidade ILIKE '%' || _cidade || '%')
    AND (_idade_min IS NULL OR p.data_nascimento IS NULL
         OR date_part('year', age(p.data_nascimento))::int >= _idade_min)
    AND (_idade_max IS NULL OR p.data_nascimento IS NULL
         OR date_part('year', age(p.data_nascimento))::int <= _idade_max)
    AND (
      _only_validated = false
      OR (p.skills_validated IS NOT NULL AND p.skills_validated <> '{}'::jsonb)
    )
    AND (
      _skill IS NULL OR _skill_min IS NULL
      OR (
        (COALESCE(NULLIF(p.skills_validated, '{}'::jsonb), p.skills) ->> _skill) IS NOT NULL
        AND ((COALESCE(NULLIF(p.skills_validated, '{}'::jsonb), p.skills) ->> _skill))::numeric >= _skill_min
      )
    )
  ORDER BY is_validated DESC, p.nome ASC
  LIMIT _lim;
END $$;
GRANT EXECUTE ON FUNCTION public.search_public_atletas(text, text, integer, integer, text, integer, boolean, integer) TO authenticated;
