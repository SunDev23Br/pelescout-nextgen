
-- 1) athlete-videos: replace overly broad SELECT
DROP POLICY IF EXISTS "athlete-videos signed url read" ON storage.objects;
CREATE POLICY "athlete-videos restricted read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'athlete-videos'
  AND auth.uid() IS NOT NULL
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'clube')
    OR public.has_role(auth.uid(), 'suporte')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.atleta_id = ((storage.foldername(name))[1])::uuid
        AND (c.iniciador_id = auth.uid() OR c.atleta_id = auth.uid())
    )
  )
);

-- 2) user_presence: restrict to authenticated
DROP POLICY IF EXISTS "presence read all" ON public.user_presence;
CREATE POLICY "presence read authenticated"
ON public.user_presence FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3) avatars: restrict listing; public URLs still work
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar listing for authenticated"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- 4) realtime.messages: scope channel subscriptions to conversation participants
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "realtime authenticated participants only" ON realtime.messages;
CREATE POLICY "realtime authenticated participants only"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  -- Topics shaped like "conversation:<uuid>" must belong to a conversation the user participates in.
  CASE
    WHEN realtime.topic() LIKE 'conversation:%' THEN
      EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
          AND (c.iniciador_id = auth.uid() OR c.atleta_id = auth.uid())
      )
    ELSE auth.uid() IS NOT NULL
  END
);
