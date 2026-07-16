import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Flag,
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  Search,
  Trash2,
  Trophy,
  UserCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { MessageList } from "@/components/chat/MessageList";
import { NewConversationDialog } from "@/components/chat/NewConversationDialog";
import {
  useConversations,
  useMessages,
  usePresence,
  usePresenceHeartbeat,
  useTyping,
} from "@/hooks/use-chat";
import { useSession } from "@/lib/session";
import { blockUser, deleteConversation, reportUser, sendMessage } from "@/lib/chat";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Converse em tempo real com olheiros e clubes na plataforma Pelé Next Gen.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  usePresenceHeartbeat();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const canStart = user?.role === "admin" || user?.role === "clube";

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.peer.nome.toLowerCase().includes(q) ||
        (c.last_message_preview ?? "").toLowerCase().includes(q),
    );
  }, [conversations, filter]);


  // Auto-select first conversation on desktop
  useEffect(() => {
    if (!activeId && conversations.length > 0 && window.innerWidth >= 768) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  if (!ready) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto -mt-2 flex h-[calc(100vh-6rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-bg2 shadow-xl">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex w-full flex-col border-r border-border bg-bg2 md:w-80",
            active && "hidden md:flex",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border p-4">
            <h1 className="text-lg font-bold">Mensagens</h1>
            {canStart && (
              <Button size="sm" onClick={() => setNewOpen(true)}>
                <MessageSquarePlus className="mr-1 h-4 w-4" />
                Nova
              </Button>
            )}
          </div>
          <div className="p-3">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou mensagem..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-full border-border bg-bg3/60 pl-9 focus-visible:ring-primary/40"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {conversations.length === 0
                  ? canStart
                    ? "Nenhuma conversa ainda. Clique em \"Nova\" para iniciar."
                    : "Você ainda não recebeu mensagens."
                  : "Nenhum resultado para sua busca."}
              </div>
            ) : (
              <ul className="space-y-0.5 px-2 pb-3">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      onContextMenu={(e) => {
                        if (!canStart) return;
                        e.preventDefault();
                        navigate({
                          to: "/atletas/$atletaId",
                          params: { atletaId: c.peer.id },
                        });
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-bg3/80 hover:translate-x-0.5",
                        c.id === activeId &&
                          "bg-primary/15 ring-1 ring-primary/30 shadow-sm",
                      )}
                      title={canStart ? "Clique para abrir · botão direito p/ ver perfil" : undefined}
                    >
                      <AthleteAvatar
                        src={c.peer.avatar_url}
                        alt={c.peer.nome}
                        className="h-11 w-11 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-sm",
                              c.unread > 0 ? "font-bold text-foreground" : "font-semibold",
                            )}
                          >
                            {c.peer.nome}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 text-[10px]",
                              c.unread > 0 ? "font-semibold text-primary" : "text-muted-foreground",
                            )}
                          >
                            {formatDistanceToNow(new Date(c.last_message_at), {
                              addSuffix: false,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "truncate text-xs",
                            c.unread > 0 ? "font-medium text-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {c.last_message_preview ?? "Conversa iniciada"}
                        </p>
                      </div>
                      {c.unread > 0 && (
                        <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-md shadow-primary/40">
                          {c.unread > 99 ? "99+" : c.unread}
                        </span>
                      )}
                    </button>

                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main */}
        <section
          className={cn(
            "flex flex-1 flex-col bg-background",
            !active && "hidden md:flex md:items-center md:justify-center",
          )}
        >
          {active && user ? (
            <ActiveConversation
              key={active.id}
              conversationId={active.id}
              peerId={active.peer.id}
              peerName={active.peer.nome}
              peerAvatar={active.peer.avatar_url}
              selfId={user.id}
              onBack={() => setActiveId(null)}
              onReport={() => setReportOpen(true)}
              onBlock={async () => {
                await blockUser(active.peer.id);
                toast.success("Usuário bloqueado");
              }}
              onDelete={async () => {
                if (!confirm(`Excluir a conversa com ${active.peer.nome}? Esta ação não pode ser desfeita.`)) return;
                try {
                  await deleteConversation(active.id);
                  toast.success("Conversa excluída");
                  setActiveId(null);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Não foi possível excluir");
                }
              }}
              onInvite={() => setInviteOpen(true)}
              canInvite={canStart === true}
              canDelete={canStart === true}
              isScout={canStart === true}
            />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Selecione uma conversa para começar.
            </div>
          )}
        </section>
      </div>

      {canStart && (
        <NewConversationDialog
          open={newOpen}
          onClose={() => setNewOpen(false)}
          onStarted={(id) => setActiveId(id)}
        />
      )}

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar usuário</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reportMotivo}
            onChange={(e) => setReportMotivo(e.target.value)}
            placeholder="Conte o que aconteceu..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!reportMotivo.trim()}
              onClick={async () => {
                if (!active) return;
                await reportUser(active.peer.id, reportMotivo.trim(), active.id);
                toast.success("Denúncia enviada");
                setReportOpen(false);
                setReportMotivo("");
              }}
            >
              Enviar denúncia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite to peneira dialog */}
      {active && canStart && (
        <InvitePeneiraDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          conversationId={active.id}
        />
      )}
    </AppLayout>
  );
}

interface ActiveProps {
  conversationId: string;
  peerId: string;
  peerName: string;
  peerAvatar: string | null;
  selfId: string;
  onBack: () => void;
  onReport: () => void;
  onBlock: () => void;
  onDelete: () => void;
  onInvite: () => void;
  canInvite: boolean;
  canDelete: boolean;
  isScout: boolean;
}

function ActiveConversation({
  conversationId,
  peerId,
  peerName,
  peerAvatar,
  selfId,
  onBack,
  onReport,
  onBlock,
  onDelete,
  onInvite,
  canInvite,
  canDelete,
  isScout,
}: ActiveProps) {
  const { messages, loading } = useMessages(conversationId);
  const presence = usePresence(peerId);
  const { peerTyping, notifyTyping } = useTyping(conversationId, peerId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingDebounceRef = useRef<number>(0);
  const [msgSearch, setMsgSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, peerTyping]);

  const isOnline = !!presence?.is_online;
  const statusLabel = isOnline
    ? "Online agora"
    : presence?.last_seen_at
      ? `Visto ${formatDistanceToNow(new Date(presence.last_seen_at), {
          addSuffix: true,
          locale: ptBR,
        })}`
      : "Offline";

  const handleTyping = () => {
    const now = Date.now();
    if (now - typingDebounceRef.current > 1500) {
      typingDebounceRef.current = now;
      void notifyTyping(selfId);
    }
  };

  const filteredMessages = useMemo(() => {
    const q = msgSearch.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => (m.content ?? "").toLowerCase().includes(q));
  }, [messages, msgSearch]);

  const peerLinkProps = isScout
    ? { to: "/atletas/$atletaId" as const, params: { atletaId: peerId } }
    : { to: "/usuarios/$userId" as const, params: { userId: peerId } };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-bg2/95 p-3 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-2 text-muted-foreground hover:bg-bg3 md:hidden"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link
          {...peerLinkProps}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 -m-1 hover:bg-bg3"
          onContextMenu={(e) => e.stopPropagation()}
          title="Ver perfil"
        >
          <div className="relative shrink-0">
            <AthleteAvatar src={peerAvatar} alt={peerName} className="h-10 w-10" />
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-bg2",
                isOnline ? "bg-emerald-500" : "bg-muted-foreground/50",
              )}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold hover:text-primary">{peerName}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {peerTyping ? (
                <>
                  <span className="inline-flex gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-200ms]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-100ms]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
                  </span>
                  <span className="text-primary">digitando…</span>
                </>
              ) : isOnline ? (
                <span className="text-emerald-500">● {statusLabel}</span>
              ) : (
                statusLabel
              )}
            </p>
          </div>
        </Link>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Buscar em mensagens"
          onClick={() => setShowSearch((s) => !s)}
          className={cn(showSearch && "bg-bg3 text-primary")}
        >
          <Search className="h-5 w-5" />
        </Button>
        {canInvite && (
          <Button size="sm" variant="outline" onClick={onInvite}>
            <Trophy className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Convidar para peneira</span>
            <span className="sm:hidden">Peneira</span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Mais opções">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isScout ? (
              <DropdownMenuItem asChild>
                <Link to="/atletas/$atletaId" params={{ atletaId: peerId }}>
                  <UserCircle className="mr-2 h-4 w-4" /> Ver perfil do atleta
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link to="/usuarios/$userId" params={{ userId: peerId }}>
                  <UserCircle className="mr-2 h-4 w-4" /> Ver perfil
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onBlock}>
              <Ban className="mr-2 h-4 w-4" /> Bloquear
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReport}>
              <Flag className="mr-2 h-4 w-4" /> Denunciar
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir conversa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {showSearch && (
        <div className="border-b border-border bg-bg2/60 p-2 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              placeholder="Buscar nesta conversa..."
              className="rounded-full border-border bg-bg3/60 pl-9"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MessageList
            messages={filteredMessages}
            selfId={selfId}
            peerTyping={peerTyping}
            searchQuery={msgSearch}
          />
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        conversationId={conversationId}
        senderId={selfId}
        onTyping={handleTyping}
      />
    </div>
  );
}


function InvitePeneiraDialog({
  open,
  onClose,
  conversationId,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}) {
  const [peneiras, setPeneiras] = useState<
    Array<{ id: string; titulo: string; data: string; cidade: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase.auth.getUser().then(({ data: auth }) => {
      const uid = auth.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      supabase
        .from("peneiras")
        .select("id, titulo, data, cidade")
        .eq("created_by", uid)
        .order("data", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          setPeneiras(data ?? []);
          setLoading(false);
        });
    });
  }, [open]);

  const handleInvite = async (p: { id: string; titulo: string; data: string; cidade: string }) => {
    setSending(p.id);
    try {
      await sendMessage({
        conversationId,
        kind: "text",
        content: `🏆 Convite para peneira:\n${p.titulo}\n📅 ${new Date(p.data).toLocaleDateString("pt-BR")} — ${p.cidade}\nVeja detalhes: /peneiras/${p.id}`,
      });
      toast.success("Convite enviado");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar para peneira</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : peneiras.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Você ainda não criou nenhuma peneira.
          </p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {peneiras.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleInvite(p)}
                  disabled={sending === p.id}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-bg2 p-3 text-left hover:bg-bg3 disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.data).toLocaleDateString("pt-BR")} · {p.cidade}
                    </p>
                  </div>
                  {sending === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Trophy className="h-4 w-4 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
