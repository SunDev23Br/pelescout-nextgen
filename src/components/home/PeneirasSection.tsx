import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Search, Users } from "lucide-react";
import type { Peneira } from "@/lib/mock-data";
import { Eyebrow, Reveal } from "./Reveal";
import { useTilt } from "@/hooks/use-tilt";

const FALLBACK =
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80";

function fmt(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

const selectCls =
  "h-11 min-w-[9rem] rounded-full border border-border bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.12em] text-foreground outline-none transition-colors focus:border-primary";

function Card({ p, delay }: { p: Peneira; delay: number }) {
  const { ref, tiltProps } = useTilt<HTMLDivElement>(4);
  const pct = p.vagas ? Math.min(100, Math.round((p.inscritos / p.vagas) * 100)) : 0;

  return (
    <Reveal as="article" delay={delay} className="[perspective:1000px]">
      <div
        ref={ref}
        {...tiltProps}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-card [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] motion-reduce:[transform:none]"
      >
        <div className="relative overflow-hidden">
          <img
            src={p.imagem || FALLBACK}
            alt={`Foto da peneira ${p.titulo}`}
            loading="lazy"
            width={1200}
            height={675}
            className="aspect-[16/9] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
              {fmt(p.data)} · {p.horario}
            </span>
            <span className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              {p.estado}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-bold leading-tight">
            {p.titulo}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {p.local} · {p.cidade}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Idades
              </dt>
              <dd className="mt-1 font-semibold">
                {p.categorias.join(" · ") || "Livre"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <Users className="h-3 w-3" /> Vagas
              </dt>
              <dd className="mt-1 font-semibold tabular-nums">
                {p.inscritos}/{p.vagas}
              </dd>
            </div>
          </dl>

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-bg3">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>

          <Link
            to="/peneiras/$peneiraId"
            params={{ peneiraId: p.id }}
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 self-start rounded-full border border-border px-5 text-xs font-bold uppercase tracking-[0.16em] transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Ver oportunidade
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export function PeneirasSection({
  peneiras,
  loading,
}: {
  peneiras: Peneira[];
  loading: boolean;
}) {
  const [uf, setUf] = useState("todos");
  const [cat, setCat] = useState("todas");
  const [quando, setQuando] = useState("todas");
  const [busca, setBusca] = useState("");

  const abertas = useMemo(
    () => peneiras.filter((p) => p.status !== "encerrada"),
    [peneiras],
  );

  const ufs = useMemo(
    () => Array.from(new Set(abertas.map((p) => p.estado))).sort(),
    [abertas],
  );
  const cats = useMemo(
    () => Array.from(new Set(abertas.flatMap((p) => p.categorias))).sort(),
    [abertas],
  );

  const lista = useMemo(() => {
    const hoje = new Date();
    const limite = new Date(hoje);
    if (quando === "30") limite.setDate(limite.getDate() + 30);
    if (quando === "90") limite.setDate(limite.getDate() + 90);

    return abertas
      .filter((p) => (uf === "todos" ? true : p.estado === uf))
      .filter((p) => (cat === "todas" ? true : p.categorias.includes(cat)))
      .filter((p) => {
        if (quando === "todas") return true;
        const d = new Date(p.data + "T00:00:00");
        return d <= limite;
      })
      .filter((p) => {
        const t = busca.trim().toLowerCase();
        if (!t) return true;
        return (
          p.titulo.toLowerCase().includes(t) ||
          p.cidade.toLowerCase().includes(t) ||
          p.organizador.toLowerCase().includes(t)
        );
      })
      .slice(0, 6);
  }, [abertas, uf, cat, quando, busca]);

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <Eyebrow>Peneiras disponíveis</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-5xl">
            Encontre sua próxima oportunidade.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Filtre por estado, faixa etária e período. Cada card mostra o local,
            o horário e quantas vagas ainda restam — a inscrição é gratuita e
            leva menos de dois minutos.
          </p>
        </div>
        <Link
          to="/peneiras"
          className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-border px-5 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          Ver todas <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Reveal>

      <Reveal className="mt-10 flex flex-wrap items-center gap-3 rounded-full border border-border bg-bg2/50 p-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Cidade ou clube"
            aria-label="Buscar por cidade ou clube"
            className="h-11 w-full rounded-full border border-border bg-transparent pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <select
          aria-label="Filtrar por estado"
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          className={selectCls}
        >
          <option value="todos">Todos os estados</option>
          {ufs.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por categoria"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className={selectCls}
        >
          <option value="todas">Todas as idades</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por data"
          value={quando}
          onChange={(e) => setQuando(e.target.value)}
          className={selectCls}
        >
          <option value="todas">Qualquer data</option>
          <option value="30">Próximos 30 dias</option>
          <option value="90">Próximos 90 dias</option>
        </select>
      </Reveal>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-3xl bg-bg2" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <p className="mt-16 text-sm text-muted-foreground">
          Nenhuma peneira encontrada com esses filtros.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p, i) => (
            <Card key={p.id} p={p} delay={i * 80} />
          ))}
        </div>
      )}
    </section>
  );
}
