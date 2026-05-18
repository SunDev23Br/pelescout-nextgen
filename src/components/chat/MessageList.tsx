import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMedia } from "./ChatMedia";
import type { MessageRow } from "@/lib/chat";

function formatDay(d: Date) {
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function MessageList({
  messages,
  selfId,
  peerTyping,
}: {
  messages: MessageRow[];
  selfId: string;
  peerTyping: boolean;
}) {
  let lastDay: string | null = null;

  return (
    <div className="flex flex-col gap-1 px-3 py-4 sm:px-6">
      {messages.map((m) => {
        const date = new Date(m.created_at);
        const dayLabel = formatDay(date);
        const showDay = dayLabel !== lastDay;
        lastDay = dayLabel;
        const mine = m.sender_id === selfId;
        return (
          <div key={m.id} className="flex flex-col">
            {showDay && (
              <div className="my-3 self-center rounded-full bg-bg3 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {dayLabel}
              </div>
            )}
            <div
              className={cn(
                "flex w-full",
                mine ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "group max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  mine
                    ? "bg-primary/15 border border-primary/30 text-foreground"
                    : "bg-bg3 text-foreground",
                )}
              >
                {m.kind === "text" && (
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
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
                    "mt-1 flex items-center gap-1 text-[10px]",
                    mine ? "justify-end text-primary/80" : "text-muted-foreground",
                  )}
                >
                  <span>{format(date, "HH:mm")}</span>
                  {mine &&
                    (m.read_at ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {peerTyping && (
        <div className="mt-2 flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl bg-bg3 px-3 py-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-200ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-100ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            <span className="ml-1">digitando…</span>
          </div>
        </div>
      )}
    </div>
  );
}
