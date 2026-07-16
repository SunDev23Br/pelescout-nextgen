import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMedia } from "./ChatMedia";
import { deleteMessage, type MessageRow } from "@/lib/chat";
import { toast } from "sonner";

function formatDay(d: Date) {
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const re = new RegExp(`(${q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="rounded bg-primary/40 px-0.5 text-foreground">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function MessageList({
  messages,
  selfId,
  peerTyping,
  searchQuery = "",
}: {
  messages: MessageRow[];
  selfId: string;
  peerTyping: boolean;
  searchQuery?: string;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  let lastDay: string | null = null;

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta mensagem? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      await deleteMessage(id);
      toast.success("Mensagem excluída");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao excluir");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-1 px-3 py-4 sm:px-6">
      {messages.map((m) => {
        const date = new Date(m.created_at);
        const dayLabel = formatDay(date);
        const showDay = dayLabel !== lastDay;
        lastDay = dayLabel;
        const mine = m.sender_id === selfId;
        const isRead = mine && !!m.read_at;
        return (
          <div key={m.id} className="flex flex-col animate-fade-in">
            {showDay && (
              <div className="my-3 self-center rounded-full bg-bg3 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {dayLabel}
              </div>
            )}
            <div
              className={cn(
                "group/msg flex w-full items-end gap-1.5",
                mine ? "justify-end" : "justify-start",
              )}
            >
              {mine && (
                <button
                  type="button"
                  onClick={() => void handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="mb-2 hidden rounded-full p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover/msg:inline-flex group-hover/msg:opacity-100"
                  aria-label="Excluir mensagem"
                  title="Excluir mensagem"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <div
                className={cn(
                  "relative max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition",
                  mine
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-bg3 text-foreground",
                )}
              >
                {m.kind === "text" && (
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {searchQuery ? highlight(m.content ?? "", searchQuery) : m.content}
                  </p>
                )}
                {m.kind !== "text" && m.media_path && (
                  <ChatMedia
                    path={m.media_path}
                    mime={m.media_mime}
                    kind={m.kind}
                  />
                )}
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[10px]",
                    mine ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  <span>{format(date, "HH:mm")}</span>
                  {mine &&
                    (isRead ? (
                      <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {peerTyping && (
        <div className="mt-2 flex justify-start animate-fade-in">
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-bg3 px-3.5 py-2.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-200ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-100ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            <span className="ml-1">digitando…</span>
          </div>
        </div>
      )}
    </div>
  );
}
