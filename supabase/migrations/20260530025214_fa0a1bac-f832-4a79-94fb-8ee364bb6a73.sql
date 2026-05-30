
-- 1) Table
CREATE TABLE public.athlete_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id uuid NOT NULL,
  path text NOT NULL,
  mime text,
  size integer,
  titulo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_athlete_videos_atleta ON public.athlete_videos(atleta_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.athlete_videos TO authenticated;
GRANT ALL ON public.athlete_videos TO service_role;

ALTER TABLE public.athlete_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "athlete_videos owner manage"
ON public.athlete_videos FOR ALL
USING (auth.uid() = atleta_id)
WITH CHECK (auth.uid() = atleta_id AND public.has_role(auth.uid(), 'atleta'));

CREATE POLICY "athlete_videos read by scouts and chat peers"
ON public.athlete_videos FOR SELECT
USING (
  auth.uid() = atleta_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'clube')
  OR public.has_role(auth.uid(), 'suporte')
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.iniciador_id = auth.uid() AND c.atleta_id = athlete_videos.atleta_id)
       OR (c.atleta_id = auth.uid() AND c.iniciador_id = athlete_videos.atleta_id)
  )
);

-- 2) Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('athlete-videos', 'athlete-videos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "athlete-videos owner upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'athlete-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "athlete-videos owner delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'athlete-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "athlete-videos signed url read"
ON storage.objects FOR SELECT
USING (bucket_id = 'athlete-videos' AND auth.role() = 'authenticated');

-- 3) RPC for chat peers
CREATE OR REPLACE FUNCTION public.get_conversation_peers(_conv_ids uuid[])
RETURNS TABLE(conversation_id uuid, peer_id uuid, nome text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id AS conversation_id,
    CASE WHEN c.iniciador_id = auth.uid() THEN c.atleta_id ELSE c.iniciador_id END AS peer_id,
    p.nome,
    p.avatar_url
  FROM public.conversations c
  JOIN public.profiles p
    ON p.id = CASE WHEN c.iniciador_id = auth.uid() THEN c.atleta_id ELSE c.iniciador_id END
  WHERE c.id = ANY(_conv_ids)
    AND (c.iniciador_id = auth.uid() OR c.atleta_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.get_conversation_peers(uuid[]) TO authenticated;
