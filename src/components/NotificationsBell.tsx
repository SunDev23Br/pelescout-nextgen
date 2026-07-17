import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useNotifications } from "@/lib/notifications";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function NotificationsBell() {
  const { user } = useSession();
  const { items, unreadCount, markAllRead, markRead, remove } = useNotifications(user?.id);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg2 text-foreground hover:bg-sidebar-accent"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 gap-1 px-2 text-xs">
              <Check className="h-3.5 w-3.5" /> Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            items.map((n) => {
              const body = (
                <div className={cn("flex gap-3 px-4 py-3 hover:bg-sidebar-accent/50", !n.read_at && "bg-primary/5")}>
                  <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", !n.read_at ? "bg-primary" : "bg-transparent")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{timeAgo(n.created_at)}</p>
                  </div>
                  <button
                    aria-label="Remover"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    className="self-start text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
              return n.link ? (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => {
                    if (!n.read_at) markRead(n.id);
                    setOpen(false);
                  }}
                  className="block border-b border-border last:border-0"
                >
                  {body}
                </Link>
              ) : (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read_at && markRead(n.id)}
                  className="block w-full border-b border-border text-left last:border-0"
                >
                  {body}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
