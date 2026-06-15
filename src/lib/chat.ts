import { supabase } from "@/integrations/supabase/client";

export type MessageKind = "text" | "image" | "video" | "file";

export interface ConversationRow {
  id: string;
  iniciador_id: string;
  atleta_id: string;
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
  last_sender_id: string | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: MessageKind;
  content: string | null;
  media_path: string | null;
  media_mime: string | null;
  media_size: number | null;
  created_at: string;
  read_at: string | null;
}

export interface ConversationWithPeer extends ConversationRow {
  peer: {
    id: string;
    nome: string;
    avatar_url: string | null;
  };
  unread: number;
}

export async function listConversations(): Promise<ConversationWithPeer[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];

  const { data: convs, error } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  if (!convs || convs.length === 0) return [];

  const convIds = convs.map((c) => c.id);

  // Resolve peer names via a SECURITY DEFINER RPC to avoid RLS edge cases on profiles.
  const { data: peerRows } = await supabase.rpc("get_conversation_peers", {
    _conv_ids: convIds,
  });
  const peerMap = new Map<string, { id: string; nome: string; avatar_url: string | null }>();
  (peerRows ?? []).forEach((r: { conversation_id: string; peer_id: string; nome: string; avatar_url: string | null }) => {
    peerMap.set(r.conversation_id, {
      id: r.peer_id,
      nome: r.nome,
      avatar_url: r.avatar_url,
    });
  });

  // unread count per conversation: messages not sent by me, read_at null
  const { data: unreadRows } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", convIds)
    .is("read_at", null)
    .neq("sender_id", uid);
  const unreadMap = new Map<string, number>();
  (unreadRows ?? []).forEach((r) => {
    unreadMap.set(r.conversation_id, (unreadMap.get(r.conversation_id) ?? 0) + 1);
  });

  return convs.map((c) => {
    const peerId = c.iniciador_id === uid ? c.atleta_id : c.iniciador_id;
    const p = peerMap.get(c.id);
    return {
      ...c,
      peer: {
        id: p?.id ?? peerId,
        nome: p?.nome ?? "Usuário",
        avatar_url: p?.avatar_url ?? null,
      },
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}

/**
 * Retorna o conjunto de user_ids de atletas que o clube atual desbloqueou
 * (via tabela contatos_desbloqueados -> candidatos.user_id).
 */
export async function getUnlockedAtletaUserIds(): Promise<Set<string>> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return new Set();
  const { data: unlocks } = await supabase
    .from("contatos_desbloqueados")
    .select("candidato_id")
    .eq("clube_id", uid);
  const candIds = (unlocks ?? []).map((u) => u.candidato_id);
  if (candIds.length === 0) return new Set();
  const { data: cands } = await supabase
    .from("candidatos")
    .select("user_id")
    .in("id", candIds);
  return new Set((cands ?? []).map((c) => c.user_id).filter((v): v is string => !!v));
}

async function currentUserIsClube(uid: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);
  const roles = (data ?? []).map((r) => r.role as string);
  // Apenas restringe quando o papel ativo é estritamente clube (não admin/suporte)
  return roles.includes("clube") && !roles.includes("admin") && !roles.includes("suporte");
}

export async function startConversation(atletaId: string): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Faça login para iniciar uma conversa.");

  // Restrição: clubes só podem conversar com atletas que pagaram para desbloquear.
  if (await currentUserIsClube(uid)) {
    const unlocked = await getUnlockedAtletaUserIds();
    if (!unlocked.has(atletaId)) {
      throw new Error(
        "Você só pode enviar mensagens para atletas cujo contato você desbloqueou na aba Clubes.",
      );
    }
  }

  // Try existing
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("iniciador_id", uid)
    .eq("atleta_id", atletaId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ iniciador_id: uid, atleta_id: atletaId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function listMessages(conversationId: string, limit = 100): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).reverse() as MessageRow[];
}

export interface SendMessageInput {
  conversationId: string;
  kind: MessageKind;
  content?: string;
  mediaPath?: string;
  mediaMime?: string;
  mediaSize?: number;
}

export async function sendMessage(input: SendMessageInput): Promise<MessageRow> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Faça login.");
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: uid,
      kind: input.kind,
      content: input.content ?? null,
      media_path: input.mediaPath ?? null,
      media_mime: input.mediaMime ?? null,
      media_size: input.mediaSize ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as MessageRow;
}

export async function deleteConversation(conversationId: string) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);
  if (error) throw new Error(error.message);
}

export async function markRead(conversationId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("read_at", null)
    .neq("sender_id", uid);
}

export async function uploadChatMedia(
  conversationId: string,
  file: File,
): Promise<{ path: string; mime: string; size: number }> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Faça login.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Arquivo maior que 20 MB.");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const mime = file.type && file.type.length > 0 ? file.type : guessMimeFromExt(ext);
  const path = `${conversationId}/${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("chat-media").upload(path, file, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { path, mime, size: file.size };
}

function guessMimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", avif: "image/avif", bmp: "image/bmp", svg: "image/svg+xml",
    heic: "image/heic", heif: "image/heif", tif: "image/tiff", tiff: "image/tiff",
    ico: "image/x-icon",
    mp4: "video/mp4", m4v: "video/x-m4v", webm: "video/webm", ogv: "video/ogg",
    mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
    flv: "video/x-flv", wmv: "video/x-ms-wmv", "3gp": "video/3gpp", "3g2": "video/3gpp2",
    mpeg: "video/mpeg", mpg: "video/mpeg", ts: "video/mp2t",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function getSignedMediaUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("chat-media")
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function searchAtletas(q: string, limit = 20) {
  let query = supabase
    .from("profiles")
    .select("id, nome, avatar_url, posicao, cidade")
    .limit(limit);
  if (q.trim()) {
    query = query.ilike("nome", `%${q.trim()}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return [];
  // Filter to only atletas
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "atleta")
    .in(
      "user_id",
      data.map((d) => d.id),
    );
  const atletaIds = new Set((roles ?? []).map((r) => r.user_id));
  return data.filter((d) => atletaIds.has(d.id));
}

export async function blockUser(blockedId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase.from("chat_blocks").insert({ blocker_id: uid, blocked_id: blockedId });
}

export async function unblockUser(blockedId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase
    .from("chat_blocks")
    .delete()
    .eq("blocker_id", uid)
    .eq("blocked_id", blockedId);
}

export async function reportUser(
  reportedId: string,
  motivo: string,
  conversationId?: string,
) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase.from("chat_reports").insert({
    reporter_id: uid,
    reported_id: reportedId,
    conversation_id: conversationId ?? null,
    motivo,
  });
}

export async function heartbeatPresence() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase
    .from("user_presence")
    .upsert({ user_id: uid, last_seen_at: new Date().toISOString(), is_online: true });
}

export async function setOffline() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase
    .from("user_presence")
    .upsert({ user_id: uid, last_seen_at: new Date().toISOString(), is_online: false });
}

export async function getPresence(userId: string) {
  const { data } = await supabase
    .from("user_presence")
    .select("user_id, last_seen_at, is_online")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
