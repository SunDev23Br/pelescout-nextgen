import { useEffect, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { searchAtletas, startConversation } from "@/lib/chat";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onStarted: (conversationId: string) => void;
}

export function NewConversationDialog({ open, onClose, onStarted }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; nome: string; avatar_url: string | null; posicao: string | null; cidade: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => {
      searchAtletas(q)
        .then((r) => setResults(r as typeof results))
        .catch((e) => toast.error(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  const handleStart = async (atletaId: string) => {
    setCreating(atletaId);
    try {
      const id = await startConversation(atletaId);
      onStarted(id);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao iniciar conversa");
    } finally {
      setCreating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar atleta pelo nome..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum atleta encontrado.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => handleStart(a.id)}
                    disabled={creating === a.id}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-bg3 disabled:opacity-60"
                  >
                    <AthleteAvatar
                      src={a.avatar_url}
                      alt={a.nome}
                      className="h-10 w-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[a.posicao, a.cidade].filter(Boolean).join(" · ") || "Atleta"}
                      </p>
                    </div>
                    {creating === a.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
