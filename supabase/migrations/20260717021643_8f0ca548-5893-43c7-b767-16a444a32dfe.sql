
-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('skill_validated','new_message','peneira_match','contact_unlocked','system')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify athlete when skills are validated
CREATE OR REPLACE FUNCTION public.tg_notify_skill_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _validator_name text;
BEGIN
  IF NEW.skills_validated IS DISTINCT FROM OLD.skills_validated
     AND NEW.skills_validated IS NOT NULL
     AND NEW.skills_validated_by IS NOT NULL THEN
    SELECT nome INTO _validator_name FROM public.profiles WHERE id = NEW.skills_validated_by;
    INSERT INTO public.notifications (user_id, kind, title, body, link, data)
    VALUES (
      NEW.id,
      'skill_validated',
      'Suas habilidades foram validadas',
      COALESCE(_validator_name, 'Um validador') || ' validou suas habilidades no seu perfil.',
      '/perfil-atleta',
      jsonb_build_object('validator_id', NEW.skills_validated_by, 'skills', NEW.skills_validated)
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_skill_validation ON public.profiles;
CREATE TRIGGER trg_notify_skill_validation
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_skill_validation();

-- Trigger: notify atleta when a new message arrives
CREATE OR REPLACE FUNCTION public.tg_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conv public.conversations%ROWTYPE;
  _recipient uuid;
  _sender_name text;
  _preview text;
BEGIN
  SELECT * INTO _conv FROM public.conversations WHERE id = NEW.conversation_id;
  IF _conv.id IS NULL THEN RETURN NEW; END IF;
  _recipient := CASE WHEN NEW.sender_id = _conv.iniciador_id THEN _conv.atleta_id ELSE _conv.iniciador_id END;
  SELECT nome INTO _sender_name FROM public.profiles WHERE id = NEW.sender_id;
  _preview := CASE
    WHEN NEW.kind = 'text' THEN left(coalesce(NEW.content,''), 120)
    WHEN NEW.kind = 'image' THEN '📷 Imagem'
    WHEN NEW.kind = 'video' THEN '🎬 Vídeo'
    ELSE '📎 Arquivo'
  END;
  INSERT INTO public.notifications (user_id, kind, title, body, link, data)
  VALUES (
    _recipient,
    'new_message',
    'Nova mensagem de ' || COALESCE(_sender_name, 'usuário'),
    _preview,
    '/chat',
    jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.tg_notify_new_message();

-- Trigger: notify clube when contact unlocked (audit + client already unlocks it)
-- Ranking / leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_athlete_leaderboard(
  _posicao text DEFAULT NULL,
  _cidade text DEFAULT NULL,
  _skill text DEFAULT NULL,
  _limit integer DEFAULT 50
)
RETURNS TABLE(
  rank integer,
  id uuid,
  nome text,
  avatar_url text,
  posicao text,
  cidade text,
  score numeric,
  is_validated boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lim int := LEAST(GREATEST(COALESCE(_limit, 50), 1), 200);
  _keys text[] := ARRAY['marcacao','forca','passe','velocidade','posicionamento'];
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      p.id, p.nome, p.avatar_url, p.posicao::text AS posicao, p.cidade,
      COALESCE(NULLIF(p.skills_validated, '{}'::jsonb), p.skills, '{}'::jsonb) AS eff,
      (p.skills_validated IS NOT NULL AND p.skills_validated <> '{}'::jsonb) AS is_validated
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'atleta'::app_role
    WHERE (_posicao IS NULL OR p.posicao::text = _posicao)
      AND (_cidade IS NULL OR p.cidade ILIKE '%' || _cidade || '%')
  ),
  scored AS (
    SELECT b.*,
      CASE
        WHEN _skill IS NOT NULL THEN NULLIF(b.eff ->> _skill, '')::numeric
        ELSE (
          SELECT AVG(NULLIF(b.eff ->> k, '')::numeric)
          FROM unnest(_keys) k
          WHERE NULLIF(b.eff ->> k, '') IS NOT NULL
        )
      END AS score
    FROM base b
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.score DESC NULLS LAST, s.is_validated DESC, s.nome)::int AS rank,
    s.id, s.nome, s.avatar_url, s.posicao, s.cidade,
    ROUND(s.score, 1) AS score,
    s.is_validated
  FROM scored s
  WHERE s.score IS NOT NULL
  ORDER BY s.score DESC NULLS LAST, s.is_validated DESC, s.nome
  LIMIT _lim;
END $$;

-- Compare athletes RPC (auth required)
CREATE OR REPLACE FUNCTION public.compare_atletas(_ids uuid[])
RETURNS TABLE(
  id uuid, nome text, avatar_url text, posicao text, cidade text,
  data_nascimento date, altura integer, peso integer, pe text,
  skills jsonb, skills_validated jsonb, is_validated boolean
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
  IF array_length(_ids, 1) IS NULL OR array_length(_ids, 1) > 3 THEN
    RAISE EXCEPTION 'Selecione entre 1 e 3 atletas';
  END IF;

  RETURN QUERY
  SELECT p.id, p.nome, p.avatar_url, p.posicao::text, p.cidade,
         p.data_nascimento, p.altura, p.peso, p.pe::text,
         p.skills, p.skills_validated,
         (p.skills_validated IS NOT NULL AND p.skills_validated <> '{}'::jsonb) AS is_validated
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'atleta'::app_role
  WHERE p.id = ANY(_ids);
END $$;
