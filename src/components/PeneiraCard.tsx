import { Link } from "@tanstack/react-router";
import { Calendar, Lock, MapPin, Users } from "lucide-react";
import type { Peneira } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PeneiraCard({ peneira }: { peneira: Peneira }) {
  const lotada = peneira.inscritos >= peneira.vagas;
  const pct = Math.min(100, (peneira.inscritos / peneira.vagas) * 100);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-gold">
      <div className="relative h-28 overflow-hidden">
        <img
          src={peneira.imagem}
          alt={peneira.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <StatusBadge status={peneira.status} />
          {peneira.visibilidade === "privada" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-dark/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
              <Lock className="h-2.5 w-2.5" /> Privada
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <h3 className="line-clamp-2 min-h-[2.25rem] font-display text-base font-bold leading-tight">
          {peneira.titulo}
        </h3>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">
              {peneira.local} · {peneira.cidade}/{peneira.estado}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>
              {formatDate(peneira.data)} · {peneira.horario}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>
              {peneira.inscritos}/{peneira.vagas} inscritos
            </span>
          </div>
        </div>

        <ul
          role="list"
          aria-label="Categorias da peneira"
          className="flex h-5 flex-nowrap gap-1 overflow-hidden"
        >
          {peneira.categorias.slice(0, 3).map((c) => (
            <li
              key={c}
              className="shrink-0 rounded-full border border-border bg-bg2 px-2 py-0 text-[9px] font-bold uppercase tracking-wider text-slate-50"
            >
              {c}
            </li>
          ))}
          {peneira.categorias.length > 3 && (
            <li className="shrink-0 rounded-full border border-border bg-bg2 px-2 py-0 text-[9px] font-bold uppercase tracking-wider text-slate-50">
              +{peneira.categorias.length - 3}
            </li>
          )}
        </ul>

        <div className="h-1 overflow-hidden rounded-full bg-bg3">
          <div
            className="h-full rounded-full bg-gradient-gold transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <Button
          asChild
          size="sm"
          className="mt-auto w-full text-xs transition-transform duration-200 hover:scale-[1.02] hover:shadow-gold"
          disabled={lotada && peneira.status === "aberta"}
        >
          <Link to="/peneiras/$peneiraId" params={{ peneiraId: peneira.id }}>
            {peneira.status === "encerrada"
              ? "Ver resultados"
              : peneira.status === "em_andamento"
                ? "Acompanhar ao vivo"
                : lotada
                  ? "Vagas esgotadas"
                  : "Inscrever-se"}
          </Link>
        </Button>
      </div>
    </article>
  );
}
