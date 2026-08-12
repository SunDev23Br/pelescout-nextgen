import { Link } from "@tanstack/react-router";
import { AuthLink } from "./AuthLink";

import { ArrowUpRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { Peneira } from "@/lib/mock-data";
import { useTilt } from "@/hooks/use-tilt";

const FALLBACK =
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80";

function dia(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
  });
}
function mes(iso: string) {
  return new Date(iso + "T00:00:00")
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
}

const STATUS_LABEL: Record<string, string> = {
  aberta: "Inscrições abertas",
  em_andamento: "Em andamento",
  encerrada: "Encerrada",
};

export function ProximaPeneiraCard({
  peneira,
  loading,
}: {
  peneira: Peneira | null;
  loading: boolean;
}) {
  const { ref, tiltProps } = useTilt<HTMLDivElement>(5);

  if (loading) {
    return (
      <div className="h-[420px] w-full animate-pulse rounded-3xl bg-bg2 lg:h-[520px]" />
    );
  }

  if (!peneira) {
    return (
      <div className="flex h-[320px] w-full flex-col items-center justify-center rounded-3xl border border-border bg-bg2/60 p-10 text-center lg:h-[420px]">
        <p className="font-display text-2xl font-bold">
          Nenhuma peneira agendada no momento.
        </p>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          Cadastre-se para receber um aviso assim que a próxima avaliação for
          publicada na sua região.
        </p>
        <Link to="/cadastro" className="mt-6">
          <span className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5">
            Criar minha conta
          </span>
        </Link>
      </div>
    );
  }

  const pct = peneira.vagas
    ? Math.min(100, Math.round((peneira.inscritos / peneira.vagas) * 100))
    : 0;

  return (
    <div
      ref={ref}
      {...tiltProps}
      className="group relative [perspective:1200px]"
    >
      <article
        className="relative overflow-hidden rounded-3xl border border-border shadow-card transition-transform duration-500 ease-out will-change-transform [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] motion-reduce:[transform:none]"
      >
        <img
          src={peneira.imagem || FALLBACK}
          alt={`Foto da peneira ${peneira.titulo}`}
          width={1200}
          height={900}
          className="h-[420px] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06] lg:h-[560px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--gold) 22%, transparent), transparent 65%)",
          }}
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-gold">
            Próxima peneira
          </span>
          <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            {STATUS_LABEL[peneira.status] ?? peneira.status}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
          <div className="flex items-end gap-5">
            <div className="rounded-2xl bg-primary px-4 py-3 text-center text-primary-foreground shadow-gold">
              <p className="font-display text-3xl font-extrabold leading-none tabular-nums">
                {dia(peneira.data)}
              </p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.18em]">
                {mes(peneira.data)}
              </p>
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-extrabold leading-tight text-white lg:text-3xl">
                {peneira.titulo}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-white/75">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {peneira.local} · {peneira.cidade}/{peneira.estado}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-white">
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
                <Clock className="h-3 w-3" /> Horário
              </dt>
              <dd className="mt-1 text-sm font-semibold">{peneira.horario}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
                <CalendarDays className="h-3 w-3" /> Idades
              </dt>
              <dd className="mt-1 truncate text-sm font-semibold">
                {peneira.categorias.join(" · ") || "Livre"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
                <Users className="h-3 w-3" /> Vagas
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums">
                {peneira.inscritos}/{peneira.vagas}
              </dd>
            </div>
          </dl>

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AuthLink
              href={`/peneiras/${peneira.id}`}
              className="group/btn relative inline-flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-gold transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98] sm:flex-none sm:text-xs"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              Ver oportunidade
              <ArrowUpRight className="h-4 w-4" />
            </AuthLink>
            <AuthLink
              href="/peneiras"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/30 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-primary hover:text-primary sm:flex-none sm:text-xs"
            >
              Ver todas
            </AuthLink>

          </div>
        </div>
      </article>
    </div>
  );
}
