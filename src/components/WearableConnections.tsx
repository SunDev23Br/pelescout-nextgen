import { useEffect, useState } from "react";
import { Loader2, RefreshCcw, Trash2, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  connectMockWearable,
  disconnectWearable,
  listMyConnections,
  startWearableOAuth,
  syncWearablesNow,
  type WearableConnectionRow,
} from "@/lib/wearables";

const PROVIDER_LABEL: Record<string, string> = {
  google_fit: "Google Fit",
  mock: "Smartwatch simulado (teste)",
};

export function WearableConnections() {
  const [conns, setConns] = useState<WearableConnectionRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setConns(await listMyConnections());
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao carregar conexões");
    }
  }

  useEffect(() => {
    refresh();
    // Pick up ?wearable=connected after OAuth redirect.
    const p = new URLSearchParams(window.location.search);
    if (p.get("wearable") === "connected") {
      toast.success("Dispositivo conectado!");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (p.get("wearable_error")) {
      toast.error(`Falha ao conectar: ${p.get("wearable_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleConnect() {
    setBusy(true);
    try {
      const url = await startWearableOAuth("google_fit");
      window.location.href = url;
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao iniciar conexão");
      setBusy(false);
    }
  }

  async function handleMockConnect() {
    setBusy(true);
    try {
      await connectMockWearable();
      toast.success("Smartwatch simulado conectado (dados de teste)");
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao conectar simulado");
    } finally {
      setBusy(false);
    }
  }

  async function handleSync() {
    setBusy(true);
    try {
      const r = await syncWearablesNow();
      toast.success(`Sincronizado (${r.synced} dispositivo(s))`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Sync falhou");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm("Desconectar este dispositivo?")) return;
    try {
      await disconnectWearable(id);
      toast.success("Desconectado");
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao desconectar");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
            <Watch className="mr-2 inline h-3 w-3" /> Dispositivos vestíveis
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conecte seu smartwatch (via Google Fit) para mostrar suas métricas
            de batimentos, passos, distância e velocidade aos olheiros.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {conns === null ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : conns.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            Nenhum dispositivo conectado.
          </p>
        ) : (
          conns.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg2 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">
                  {PROVIDER_LABEL[c.provider] ?? c.provider}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.last_sync_at
                    ? `Último sync: ${new Date(c.last_sync_at).toLocaleString("pt-BR")}`
                    : "Aguardando primeira sincronização…"}
                </p>
                {c.last_sync_error && (
                  <p className="text-xs text-destructive">Erro: {c.last_sync_error}</p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleDisconnect(c.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Desconectar
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={handleConnect} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Watch className="mr-2 h-4 w-4" />}
          Conectar Google Fit
        </Button>
        {conns && conns.length > 0 && (
          <Button type="button" variant="outline" onClick={handleSync} disabled={busy}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Sincronizar agora
          </Button>
        )}
      </div>
    </section>
  );
}
