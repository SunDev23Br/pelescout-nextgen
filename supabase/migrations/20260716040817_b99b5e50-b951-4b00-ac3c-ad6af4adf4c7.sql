
-- 1. Skill columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS skills_validated jsonb,
  ADD COLUMN IF NOT EXISTS skills_validated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS skills_validated_at timestamptz;

-- 2. Range validator trigger (0-100 for known skill keys)
CREATE OR REPLACE FUNCTION public.tg_profiles_validate_skills()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  k text;
  v numeric;
  keys text[] := ARRAY['marcacao','forca','passe','velocidade','posicionamento'];
BEGIN
  IF NEW.skills IS NOT NULL THEN
    FOREACH k IN ARRAY keys LOOP
      IF NEW.skills ? k AND (NEW.skills ->> k) <> '' THEN
        v := (NEW.skills ->> k)::numeric;
        IF v < 0 OR v > 100 THEN
          RAISE EXCEPTION 'Habilidade % deve estar entre 0 e 100 (recebeu %)', k, v;
        END IF;
      END IF;
    END LOOP;
  END IF;
  IF NEW.skills_validated IS NOT NULL THEN
    FOREACH k IN ARRAY keys LOOP
      IF NEW.skills_validated ? k AND (NEW.skills_validated ->> k) <> '' THEN
        v := (NEW.skills_validated ->> k)::numeric;
        IF v < 0 OR v > 100 THEN
          RAISE EXCEPTION 'Habilidade validada % deve estar entre 0 e 100 (recebeu %)', k, v;
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_profiles_validate_skills ON public.profiles;
CREATE TRIGGER tg_profiles_validate_skills
  BEFORE INSERT OR UPDATE OF skills, skills_validated ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_validate_skills();

-- 3. Skill history table
CREATE TABLE IF NOT EXISTS public.athlete_skill_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('self','validated')),
  validator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  skills jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.athlete_skill_history TO authenticated;
GRANT ALL ON public.athlete_skill_history TO service_role;

ALTER TABLE public.athlete_skill_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "athlete reads own skill history"
  ON public.athlete_skill_history FOR SELECT
  USING (atleta_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "validator reads their entries"
  ON public.athlete_skill_history FOR SELECT
  USING (validator_id = auth.uid());

CREATE INDEX IF NOT EXISTS ix_ash_atleta_created
  ON public.athlete_skill_history(atleta_id, created_at DESC);

-- 4. Trigger: log every skill change
CREATE OR REPLACE FUNCTION public.tg_profiles_skill_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.skills IS DISTINCT FROM OLD.skills
       AND NEW.skills <> '{}'::jsonb THEN
      INSERT INTO public.athlete_skill_history(atleta_id, source, validator_id, skills)
      VALUES (NEW.id, 'self', NULL, NEW.skills);
    END IF;
    IF NEW.skills_validated IS DISTINCT FROM OLD.skills_validated
       AND NEW.skills_validated IS NOT NULL THEN
      INSERT INTO public.athlete_skill_history(atleta_id, source, validator_id, skills)
      VALUES (NEW.id, 'validated', NEW.skills_validated_by, NEW.skills_validated);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_profiles_skill_history ON public.profiles;
CREATE TRIGGER tg_profiles_skill_history
  AFTER UPDATE OF skills, skills_validated ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_skill_history();

-- 5. Skill validators (invites)
CREATE TABLE IF NOT EXISTS public.athlete_skill_validators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  validator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text,
  invited_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  CHECK (validator_id IS NOT NULL OR invited_email IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_asv_atleta_validator
  ON public.athlete_skill_validators(atleta_id, validator_id)
  WHERE validator_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_asv_atleta_email
  ON public.athlete_skill_validators(atleta_id, lower(invited_email))
  WHERE invited_email IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_skill_validators TO authenticated;
GRANT ALL ON public.athlete_skill_validators TO service_role;

ALTER TABLE public.athlete_skill_validators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "athlete manages own validators"
  ON public.athlete_skill_validators FOR ALL
  USING (atleta_id = auth.uid())
  WITH CHECK (atleta_id = auth.uid());

CREATE POLICY "validator sees own invite"
  ON public.athlete_skill_validators FOR SELECT
  USING (
    validator_id = auth.uid()
    OR (invited_email IS NOT NULL
        AND lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );

CREATE POLICY "validator updates own invite"
  ON public.athlete_skill_validators FOR UPDATE
  USING (
    validator_id = auth.uid()
    OR (invited_email IS NOT NULL
        AND lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );

-- 6. Permission function
CREATE OR REPLACE FUNCTION public.can_validate_athlete(_validator uuid, _atleta uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.has_role(_validator, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.athlete_skill_validators v
      WHERE v.atleta_id = _atleta
        AND v.status = 'accepted'
        AND (
          v.validator_id = _validator
          OR (
            v.invited_email IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM auth.users u
              WHERE u.id = _validator AND lower(u.email) = lower(v.invited_email)
            )
          )
        )
    )
    OR (
      public.has_role(_validator, 'clube'::app_role)
      AND public.clube_has_unlocked_atleta(_validator, _atleta)
    );
$$;

-- 7. RPC to set validated skills
CREATE OR REPLACE FUNCTION public.set_validated_skills(_atleta uuid, _skills jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_validate_athlete(auth.uid(), _atleta) THEN
    RAISE EXCEPTION 'Sem permissão para validar as habilidades deste atleta';
  END IF;
  UPDATE public.profiles
    SET skills_validated = _skills,
        skills_validated_by = auth.uid(),
        skills_validated_at = now()
    WHERE id = _atleta;
END $$;

-- 8. RPC for invited email user to accept an invite
CREATE OR REPLACE FUNCTION public.accept_skill_validator_invite(_invite_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
BEGIN
  SELECT lower(email) INTO _email FROM auth.users WHERE id = auth.uid();
  UPDATE public.athlete_skill_validators
    SET status = 'accepted',
        accepted_at = now(),
        validator_id = COALESCE(validator_id, auth.uid())
    WHERE id = _invite_id
      AND status = 'pending'
      AND (validator_id = auth.uid() OR lower(invited_email) = _email);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado ou não pertence a você';
  END IF;
END $$;

-- 9. Cleanup: normalize club history (period AAAA - AAAA, initcap on name)
UPDATE public.profiles
SET historico_clubes = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_strip_nulls(
        jsonb_build_object(
          'clube', NULLIF(initcap(trim(COALESCE(elem->>'clube',''))), ''),
          'periodo', NULLIF(
            regexp_replace(
              trim(COALESCE(elem->>'periodo','')),
              '\s*[-–—]\s*',
              ' – ',
              'g'
            ), ''),
          'descricao', NULLIF(trim(COALESCE(elem->>'descricao','')), '')
        )
      )
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(historico_clubes) elem
)
WHERE jsonb_typeof(historico_clubes) = 'array'
  AND jsonb_array_length(historico_clubes) > 0;
