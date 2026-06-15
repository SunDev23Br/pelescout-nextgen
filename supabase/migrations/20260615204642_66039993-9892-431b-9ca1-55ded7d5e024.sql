
-- 1) candidatos: require authenticated user and self user_id
DROP POLICY IF EXISTS "atleta self insert" ON public.candidatos;
CREATE POLICY "atleta self insert"
ON public.candidatos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND auth.uid() = user_id);

-- 2) messages: restrict UPDATE to the sender only (recipients use a dedicated
--    read-receipt policy that only allows toggling read_at).
DROP POLICY IF EXISTS "msg update read participants" ON public.messages;

CREATE POLICY "msg update own"
ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid() AND is_conversation_participant(conversation_id, auth.uid()))
WITH CHECK (sender_id = auth.uid() AND is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "msg mark read recipient"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  sender_id <> auth.uid()
  AND is_conversation_participant(conversation_id, auth.uid())
)
WITH CHECK (
  sender_id <> auth.uid()
  AND is_conversation_participant(conversation_id, auth.uid())
);

-- 3) chat-media storage: require conversation participation for DELETE,
--    in addition to being the uploader.
DROP POLICY IF EXISTS "chat media delete own" ON storage.objects;
CREATE POLICY "chat media delete own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-media'
  AND (auth.uid())::text = (storage.foldername(name))[2]
  AND public.is_conversation_participant(((storage.foldername(name))[1])::uuid, auth.uid())
);
