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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-gold">
      <div className="relative h-44 overflow-hidden">
        <img
          src={peneira.imagem}
          alt={peneira.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <StatusBadge status={peneira.status} />
          {peneira.visibilidade === "privada" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-dark/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
              <Lock className="h-3 w-3" /> Privada (olheiros)
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight">
          {peneira.titulo}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">
              {peneira.local} · {peneira.cidade}/{peneira.estado}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {formatDate(peneira.data)} · {peneira.horario}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {peneira.inscritos}/{peneira.vagas} inscritos
            </span>
          </div>
        </div>

        {peneira.categorias.length > 0 && (
          <ul
            role="list"
            aria-label="Categorias da peneira"
            className="flex flex-wrap gap-1.5"
          >
            {peneira.categorias.map((c) => (
              <li
                key={c}
                className="rounded-full border border-border bg-bg2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-50"
              >
                {c}
              </li>
            ))}
          </ul>
        )}

        <div className="h-1.5 overflow-hidden rounded-full bg-bg3">
          <div
            className="h-full rounded-full bg-gradient-gold transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <Button asChild className="mt-auto w-full" disabled={lotada}>
          <Link to="/peneiras/$peneiraId" params={{ peneiraId: peneira.id }}>
            {peneira.status === "encerrada"
              ? "Ver resultados"
              : lotada
                ? "Vagas esgotadas"
                : "Ver detalhes"}
          </Link>
        </Button>
      </div>
    </article>
  );
}
