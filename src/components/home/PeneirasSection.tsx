import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Peneira } from "@/lib/mock-data";
import { Eyebrow, Reveal } from "./Reveal";

function fmt(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

const selectCls =
  "h-10 min-w-[9rem] border border-border bg-transparent px-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground outline-none transition-colors focus:border-primary";

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
        </div>
        <Link
          to="/peneiras"
          className="inline-flex items-center gap-2 border-b border-foreground/25 pb-1 text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
        >
          Ver todas <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Reveal>

      <Reveal className="mt-10 flex flex-wrap items-center gap-3 border-y border-border py-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Cidade ou clube"
          aria-label="Buscar por cidade ou clube"
          className="h-10 flex-1 min-w-[12rem] border border-border bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
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
        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse bg-bg2" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <p className="mt-16 text-sm text-muted-foreground">
          Nenhuma peneira encontrada com esses filtros.
        </p>
      ) : (
        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p, i) => (
            <Reveal
              as="article"
              key={p.id}
              delay={i * 80}
              className="group flex flex-col justify-between bg-background p-7 transition-colors hover:bg-bg2"
            >
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    {fmt(p.data)} · {p.horario}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {p.estado}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold leading-tight">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.local} · {p.cidade}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Idades
                    </dt>
                    <dd className="mt-1 font-semibold">
                      {p.categorias.join(" · ") || "Livre"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Vagas
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      {p.inscritos}/{p.vagas}
                    </dd>
                  </div>
                </dl>
              </div>

              <Link
                to="/peneiras/$peneiraId"
                params={{ peneiraId: p.id }}
                className="mt-7 inline-flex items-center gap-2 self-start border-b border-foreground/25 pb-1 text-xs font-bold uppercase tracking-[0.18em] transition-colors group-hover:border-primary group-hover:text-primary"
              >
                Ver oportunidade
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
