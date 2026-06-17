import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type ConversationWithPeer,
  type MessageRow,
  heartbeatPresence,
  listConversations,
  listMessages,
  markRead,
  setOffline,
} from "@/lib/chat";

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithPeer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // Periodic refresh (Realtime broadcast on conversations was removed for privacy).
    const id = setInterval(() => void refresh(), 15_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { conversations, loading, refresh };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const convRef = useRef(conversationId);
  convRef.current = conversationId;

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listMessages(conversationId)
      .then(setMessages)
      .finally(() => setLoading(false));

    void markRead(conversationId);

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as MessageRow;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          void markRead(conversationId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as MessageRow;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const appendOptimistic = (m: MessageRow) =>
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));

  return { messages, loading, appendOptimistic };
}

export function usePresenceHeartbeat() {
  useEffect(() => {
    void heartbeatPresence();
    const id = setInterval(() => void heartbeatPresence(), 30_000);
    const onUnload = () => void setOffline();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", onUnload);
      void setOffline();
    };
  }, []);
}

export function usePresence(userId: string | null) {
  const [presence, setPresence] = useState<{ is_online: boolean; last_seen_at: string } | null>(
    null,
  );
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("user_presence")
        .select("is_online, last_seen_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (!cancelled) setPresence(data);
    };
    void load();
    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setPresence({
              is_online: (payload.new as { is_online: boolean }).is_online,
              last_seen_at: (payload.new as { last_seen_at: string }).last_seen_at,
            });
          }
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);
  return presence;
}

/**
 * Indicador de "digitando" usando broadcast channel (sem persistência).
 */
export function useTyping(conversationId: string | null, peerId: string | null) {
  const [peerTyping, setPeerTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`typing-${conversationId}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.user_id === peerId) {
          setPeerTyping(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setPeerTyping(false), 2500);
        }
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearTimeout(timerRef.current);
      channelRef.current = null;
    };
  }, [conversationId, peerId]);

  const notifyTyping = async (userId: string) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: userId },
    });
  };

  return { peerTyping, notifyTyping };
}
