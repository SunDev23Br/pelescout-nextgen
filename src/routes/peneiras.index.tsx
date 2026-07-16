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

  const { user } = useSession();
  const isSuporte = user?.role === "suporte";

  async function loadDb() {
    const list = await fetchPeneirasFromDb();
    setDbPeneiras(list);
  }

  useEffect(() => {
    loadDb();
  }, []);

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

  const list = useMemo(() => {
    const merged: Peneira[] = [...dbPeneiras, ...mockPeneiras];
    const seen = new Set<string>();
    const unique = merged.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    return unique.filter((p) => {
      if (hiddenIds.has(p.id)) return false;
      if (filter !== "todas" && p.status !== filter) return false;
      if (!q.trim()) return true;
      const term = q.toLowerCase();
      return (
        p.titulo.toLowerCase().includes(term) ||
        p.cidade.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term)
      );
    });
  }, [q, filter, hiddenIds, dbPeneiras]);

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Peneiras
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Encontre sua próxima oportunidade
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explore as peneiras disponíveis em todo o Brasil e inscreva-se com poucos cliques.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, cidade ou estado..."
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {filter !== "todas" && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 border-border bg-background p-2">
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

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-lg font-bold">Nenhuma peneira encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente ajustar os filtros ou termos de busca.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="relative">
              <PeneiraCard peneira={p} />
              {isSuporte && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(p.id, p.titulo)}
                  aria-label={`Excluir peneira ${p.titulo}`}
                  className="absolute right-3 top-3 z-10 gap-1.5 shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4" />
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
