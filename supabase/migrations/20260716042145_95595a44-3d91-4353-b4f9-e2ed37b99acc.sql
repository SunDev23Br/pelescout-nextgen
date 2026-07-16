
-- Percentile RPC: returns per-skill percentile (0-100) of an athlete among
-- peers sharing the same position. Uses validated skills when available,
-- else self skills. Only counts peers with a non-null value for each skill.
CREATE OR REPLACE FUNCTION public.get_athlete_skill_percentiles(_atleta uuid)
RETURNS TABLE(skill text, value numeric, percentile numeric, peer_count integer, avg_value numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pos text;
  _skills jsonb;
  keys text[] := ARRAY['marcacao','forca','passe','velocidade','posicionamento'];
  k text;
  v numeric;
  peers integer;
  below integer;
  avg_v numeric;
BEGIN
  SELECT p.posicao::text,
         COALESCE(NULLIF(p.skills_validated, '{}'::jsonb), p.skills, '{}'::jsonb)
    INTO _pos, _skills
  FROM public.profiles p
  WHERE p.id = _atleta;

  IF _pos IS NULL THEN RETURN; END IF;

  FOREACH k IN ARRAY keys LOOP
    v := NULLIF(_skills ->> k, '')::numeric;

    SELECT COUNT(*)::int,
           AVG((COALESCE(NULLIF(pr.skills_validated, '{}'::jsonb), pr.skills) ->> k)::numeric)
      INTO peers, avg_v
    FROM public.profiles pr
    JOIN public.user_roles ur ON ur.user_id = pr.id AND ur.role = 'atleta'::app_role
    WHERE pr.posicao::text = _pos
      AND pr.id <> _atleta
      AND (COALESCE(NULLIF(pr.skills_validated, '{}'::jsonb), pr.skills) ->> k) IS NOT NULL
      AND (COALESCE(NULLIF(pr.skills_validated, '{}'::jsonb), pr.skills) ->> k) <> '';

    IF v IS NULL OR peers = 0 THEN
      skill := k; value := v; percentile := NULL; peer_count := COALESCE(peers,0); avg_value := avg_v;
      RETURN NEXT; CONTINUE;
    END IF;

    SELECT COUNT(*)::int INTO below
    FROM public.profiles pr
    JOIN public.user_roles ur ON ur.user_id = pr.id AND ur.role = 'atleta'::app_role
    WHERE pr.posicao::text = _pos
      AND pr.id <> _atleta
      AND ((COALESCE(NULLIF(pr.skills_validated, '{}'::jsonb), pr.skills) ->> k))::numeric < v;

    skill := k;
    value := v;
    percentile := ROUND((below::numeric / peers::numeric) * 100, 0);
    peer_count := peers;
    avg_value := ROUND(avg_v, 1);
    RETURN NEXT;
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.get_athlete_skill_percentiles(uuid) TO authenticated;
