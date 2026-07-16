import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, MapPin, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PeneiraCard } from "@/components/PeneiraCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { peneiras as mockPeneiras, type Peneira, type StatusPeneira } from "@/lib/mock-data";
import { fetchPeneirasFromDb } from "@/lib/peneiras.db";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UF_COORDS, haversineKm } from "@/lib/geo";

export const Route = createFileRoute("/peneiras/")({
  head: () => ({
    meta: [
      { title: "Peneiras — Pelé Next Gen" },
      {
        name: "description",
        content: "Encontre e inscreva-se em peneiras oficiais da Pelé Next Gen.",
      },
    ],
  }),
  component: PeneirasPage,
});

const FILTERS: { value: StatusPeneira | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "aberta", label: "Abertas" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "encerrada", label: "Encerradas" },
];

function PeneirasPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<StatusPeneira | "todas">("todas");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [dbPeneiras, setDbPeneiras] = useState<Peneira[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  const { user } = useSession();
  const isSuporte = user?.role === "suporte";

  async function loadDb() {
    setLoading(true);
    const list = await fetchPeneirasFromDb();
    setDbPeneiras(list);
    setLoading(false);
  }

  useEffect(() => {
    loadDb();
  }, []);

  function requestGeo() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("denied");
      toast.error("Geolocalização não disponível no seu navegador.");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied");
        toast.error("Não foi possível obter sua localização.");
      },
      { timeout: 8000 },
    );
  }

  async function handleDelete(id: string, titulo: string) {
    if (!confirm(`Excluir a peneira "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    setHiddenIds((prev) => new Set(prev).add(id));
    const { error } = await supabase.from("peneiras").delete().eq("id", id);
    if (error && !error.message.toLowerCase().includes("0 rows")) {
      toast.error(`Erro ao excluir no banco: ${error.message}`);
      return;
    }
    toast.success("Peneira excluída.");
    loadDb();
  }

  const allUnique = useMemo(() => {
    const merged: Peneira[] = [...dbPeneiras, ...mockPeneiras];
    const seen = new Set<string>();
    return merged.filter((p) => {
      if (seen.has(p.id) || hiddenIds.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [dbPeneiras, hiddenIds]);

  const list = useMemo(() => {
    return allUnique.filter((p) => {
      if (filter !== "todas" && p.status !== filter) return false;
      if (!q.trim()) return true;
      const term = q.toLowerCase();
      return (
        p.titulo.toLowerCase().includes(term) ||
        p.cidade.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term)
      );
    });
  }, [q, filter, allUnique]);

  const nearby = useMemo(() => {
    if (!userCoords) return [];
    return allUnique
      .filter((p) => p.status === "aberta" && UF_COORDS[p.estado])
      .map((p) => ({ p, km: haversineKm(userCoords, UF_COORDS[p.estado]) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);
  }, [userCoords, allUnique]);

  return (
    <AppLayout>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Peneiras
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
          Encontre sua próxima oportunidade
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/75">
          Descubra peneiras em todo o Brasil e dê o próximo passo na sua carreira.
        </p>
      </header>

      {/* Peneiras próximas de você */}
      <section className="mb-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-3.5 shadow-card animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-gold text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-sm font-extrabold">Peneiras próximas de você</h2>
              <p className="text-[10px] text-foreground/70">
                {geoStatus === "granted"
                  ? "Ordenadas pela distância até sua localização"
                  : "Ative a localização para ver as peneiras mais perto"}
              </p>
            </div>
          </div>
          {geoStatus !== "granted" && (
            <Button
              size="sm"
              onClick={requestGeo}
              disabled={geoStatus === "loading"}
              className="h-8 text-xs shadow-gold"
            >
              <MapPin className="mr-1 h-3.5 w-3.5" />
              {geoStatus === "loading" ? "Localizando..." : "Usar localização"}
            </Button>
          )}
        </div>
        {geoStatus === "granted" && (
          nearby.length === 0 ? (
            <p className="mt-3 text-xs text-foreground/70">
              Nenhuma peneira aberta encontrada perto de você no momento.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map(({ p, km }) => (
                <div key={p.id} className="relative">
                  <span className="absolute right-2 top-2 z-10 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
                    {Math.round(km)} km
                  </span>
                  <PeneiraCard peneira={p} />
                </div>
              ))}
            </div>
          )
        )}
      </section>

      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busque por cidade, clube ou estado..."
            className="h-9 pl-9 text-sm placeholder:text-foreground/50"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              className="h-9 shrink-0 gap-1.5 bg-primary/15 text-sm text-primary ring-1 ring-primary/30 hover:bg-primary/25"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {filter !== "todas" && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 border-border bg-background p-2">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <div className="flex flex-col gap-0.5">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={
                      "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors " +
                      (active
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-bg2")
                    }
                  >
                    {f.label}
                    {active && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[280px] animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-display text-base font-bold">Nenhuma peneira encontrada</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tente ajustar os filtros ou termos de busca.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, idx) => (
            <div
              key={p.id}
              className="relative animate-fade-in"
              style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
            >
              <PeneiraCard peneira={p} />
              {isSuporte && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(p.id, p.titulo)}
                  aria-label={`Excluir peneira ${p.titulo}`}
                  className="absolute right-2 top-2 z-10 h-7 gap-1 px-2 text-xs shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
