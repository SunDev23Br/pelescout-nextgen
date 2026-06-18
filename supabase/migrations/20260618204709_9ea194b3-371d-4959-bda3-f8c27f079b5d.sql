
-- Helper: does this clube have an unlock entry for this atleta user_id?
-- contatos_desbloqueados.candidato_id may reference either candidatos.id OR profiles.id (atleta user_id directly).
CREATE OR REPLACE FUNCTION public.clube_has_unlocked_atleta(_clube_id uuid, _atleta_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contatos_desbloqueados cd
    WHERE cd.clube_id = _clube_id
      AND (
        cd.candidato_id = _atleta_user_id
        OR cd.candidato_id IN (
          SELECT c.id FROM public.candidatos c WHERE c.user_id = _atleta_user_id
        )
      )
  );
$$;

-- Are two users participants in any shared conversation?
CREATE OR REPLACE FUNCTION public.users_share_conversation(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE (iniciador_id = _a AND atleta_id = _b)
       OR (iniciador_id = _b AND atleta_id = _a)
  );
$$;

-- 1) profiles: tighten "scouts read atleta profiles" to require an unlock for clubes.
DROP POLICY IF EXISTS "scouts read atleta profiles" ON public.profiles;
CREATE POLICY "scouts read atleta profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(id, 'atleta'::app_role)
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'clube'::app_role)
      AND public.clube_has_unlocked_atleta(auth.uid(), id)
    )
  )
);

-- 2) user_presence: restrict reads to self and shared-conversation peers.
DROP POLICY IF EXISTS "presence read authenticated" ON public.user_presence;
CREATE POLICY "presence read self or peers"
ON public.user_presence
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.users_share_conversation(auth.uid(), user_id)
);

-- 3) wearable_daily_metrics: clubes only see unlocked atletas; admin/suporte keep full access.
DROP POLICY IF EXISTS "Olheiros e clubes veem métricas dos atletas" ON public.wearable_daily_metrics;
CREATE POLICY "Scouts veem métricas de atletas desbloqueados"
ON public.wearable_daily_metrics
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'suporte'::app_role)
  OR (
    has_role(auth.uid(), 'clube'::app_role)
    AND public.clube_has_unlocked_atleta(auth.uid(), user_id)
  )
);
