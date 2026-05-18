-- ============ Tipos ============
DO $$ BEGIN
  CREATE TYPE public.message_kind AS ENUM ('text','image','video','file');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.report_status AS ENUM ('open','reviewed','dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ Tabelas ============
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iniciador_id uuid NOT NULL,
  atleta_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_preview text,
  last_sender_id uuid,
  CONSTRAINT conversations_unique UNIQUE (iniciador_id, atleta_id),
  CONSTRAINT conversations_distinct CHECK (iniciador_id <> atleta_id)
);
CREATE INDEX IF NOT EXISTS idx_conversations_iniciador ON public.conversations(iniciador_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_atleta ON public.conversations(atleta_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  kind public.message_kind NOT NULL DEFAULT 'text',
  content text,
  media_path text,
  media_mime text,
  media_size integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_blocks_blocked ON public.chat_blocks(blocked_id);

CREATE TABLE IF NOT EXISTS public.chat_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_id uuid NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  motivo text NOT NULL,
  status public.report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  is_online boolean NOT NULL DEFAULT false
);

-- ============ Helpers ============
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conv_id AND (iniciador_id = _user_id OR atleta_id = _user_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.users_blocked(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_blocks
    WHERE (blocker_id = _a AND blocked_id = _b)
       OR (blocker_id = _b AND blocked_id = _a)
  );
$$;

-- ============ Triggers ============
-- Anti-spam + bloqueio em mensagens
CREATE OR REPLACE FUNCTION public.tg_messages_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _conv public.conversations%ROWTYPE;
  _other uuid;
  _recent_count integer;
BEGIN
  SELECT * INTO _conv FROM public.conversations WHERE id = NEW.conversation_id;
  IF _conv.id IS NULL THEN
    RAISE EXCEPTION 'Conversa inválida';
  END IF;
  IF NEW.sender_id NOT IN (_conv.iniciador_id, _conv.atleta_id) THEN
    RAISE EXCEPTION 'Remetente não participa da conversa';
  END IF;
  _other := CASE WHEN NEW.sender_id = _conv.iniciador_id THEN _conv.atleta_id ELSE _conv.iniciador_id END;
  IF public.users_blocked(NEW.sender_id, _other) THEN
    RAISE EXCEPTION 'Usuários bloqueados não podem trocar mensagens';
  END IF;
  SELECT COUNT(*) INTO _recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '60 seconds';
  IF _recent_count >= 30 THEN
    RAISE EXCEPTION 'Limite de mensagens excedido. Aguarde alguns segundos.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS messages_guard ON public.messages;
CREATE TRIGGER messages_guard BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.tg_messages_guard();

-- Atualiza prévia da conversa
CREATE OR REPLACE FUNCTION public.tg_messages_bump_conversation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      last_sender_id = NEW.sender_id,
      last_message_preview = CASE
        WHEN NEW.kind = 'text' THEN left(coalesce(NEW.content,''), 140)
        WHEN NEW.kind = 'image' THEN '📷 Imagem'
        WHEN NEW.kind = 'video' THEN '🎬 Vídeo'
        WHEN NEW.kind = 'file' THEN '📎 Arquivo'
      END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS messages_bump_conversation ON public.messages;
CREATE TRIGGER messages_bump_conversation AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.tg_messages_bump_conversation();

-- Guarda na criação de conversas (papel + limite diário)
CREATE OR REPLACE FUNCTION public.tg_conversations_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _new_today integer;
BEGIN
  IF NOT (public.has_role(NEW.iniciador_id, 'admin') OR public.has_role(NEW.iniciador_id, 'clube')) THEN
    RAISE EXCEPTION 'Apenas olheiros e clubes podem iniciar conversas';
  END IF;
  IF NOT public.has_role(NEW.atleta_id, 'atleta') THEN
    RAISE EXCEPTION 'Conversas só podem ser iniciadas com atletas';
  END IF;
  IF public.users_blocked(NEW.iniciador_id, NEW.atleta_id) THEN
    RAISE EXCEPTION 'Usuários bloqueados';
  END IF;
  SELECT COUNT(*) INTO _new_today
  FROM public.conversations
  WHERE iniciador_id = NEW.iniciador_id AND created_at > now() - interval '1 day';
  IF _new_today >= 20 THEN
    RAISE EXCEPTION 'Limite diário de novas conversas atingido';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS conversations_guard ON public.conversations;
CREATE TRIGGER conversations_guard BEFORE INSERT ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.tg_conversations_guard();

-- ============ RLS ============
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- conversations
CREATE POLICY "conv read participants" ON public.conversations FOR SELECT
USING (auth.uid() IN (iniciador_id, atleta_id) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'suporte'));

CREATE POLICY "conv insert iniciador" ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = iniciador_id
  AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'clube'))
);

-- messages
CREATE POLICY "msg read participants" ON public.messages FOR SELECT
USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'suporte'));

CREATE POLICY "msg insert participants" ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_conversation_participant(conversation_id, auth.uid())
);

CREATE POLICY "msg update read participants" ON public.messages FOR UPDATE
USING (public.is_conversation_participant(conversation_id, auth.uid()))
WITH CHECK (public.is_conversation_participant(conversation_id, auth.uid()));

-- chat_blocks
CREATE POLICY "blocks own read" ON public.chat_blocks FOR SELECT
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);
CREATE POLICY "blocks own insert" ON public.chat_blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocks own delete" ON public.chat_blocks FOR DELETE
USING (auth.uid() = blocker_id);

-- chat_reports
CREATE POLICY "reports own insert" ON public.chat_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports own read" ON public.chat_reports FOR SELECT
USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'suporte') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reports suporte update" ON public.chat_reports FOR UPDATE
USING (public.has_role(auth.uid(),'suporte'))
WITH CHECK (public.has_role(auth.uid(),'suporte'));

-- user_presence (público para leitura, write apenas próprio)
CREATE POLICY "presence read all" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "presence upsert own" ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "presence update own" ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Realtime ============
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ Storage bucket ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', false)
ON CONFLICT (id) DO NOTHING;

-- Policies de storage: o primeiro segmento do path é o conversation_id
CREATE POLICY "chat media read participants" ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-media'
  AND public.is_conversation_participant(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "chat media insert participants" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media'
  AND public.is_conversation_participant(((storage.foldername(name))[1])::uuid, auth.uid())
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "chat media delete own" ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);