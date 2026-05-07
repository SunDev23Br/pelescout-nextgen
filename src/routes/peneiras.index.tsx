import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Search, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PeneiraCard } from "@/components/PeneiraCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { peneiras, type StatusPeneira } from "@/lib/mock-data";
import { useSession } from "@/lib/session";

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

  const { user } = useSession();

  const list = useMemo(() => {
    return peneiras.filter((p) => {
      if (filter !== "todas" && p.status !== filter) return false;
      // Peneiras privadas: atletas veem todas; olheiros/clubes só veem se tiverem convite ou se for pública
      if (p.visibilidade === "privada" && user && (user.role === "clube" || user.role === "admin")) {
        // Olheiros só veem privadas com convite (simplificado: sempre mostram na listagem mas com badge)
        // Na prática aqui mostramos todas para simplificar; a restrição real é no acesso ao conteúdo
      }
      if (!q.trim()) return true;
      const term = q.toLowerCase();
      return (
        p.titulo.toLowerCase().includes(term) ||
        p.cidade.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term)
      );
    });
  }, [q, filter, user]);

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
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-border bg-bg2 p-1">
          <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={
                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors " +
                (filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
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
            <PeneiraCard key={p.id} peneira={p} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
