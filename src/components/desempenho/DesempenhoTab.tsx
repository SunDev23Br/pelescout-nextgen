import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fromISODate } from "@/lib/date";
import {
  getMeuDesempenho,
  type AvaliacaoItem,
  type PeneiraDesempenho,
} from "@/lib/desempenho.functions";
import { toast } from "sonner";

const ATTR_LABELS: { key: keyof AvaliacaoItem; label: string }[] = [
  { key: "tecnica", label: "Técnico" },
  { key: "fisico", label: "Físico" },
  { key: "tatico", label: "Tático" },
  { key: "mental", label: "Mental" },
  { key: "intensidade", label: "Intensidade" },
  { key: "pe_bonus", label: "Pé" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = fromISODate(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function decisaoBadge(decisao: string | null | undefined) {
  switch (decisao) {
    case "aprovado":
      return { label: "Aprovado", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    case "rejeitado":
      return { label: "Rejeitado", cls: "bg-red-500/15 text-red-400 border-red-500/30" };
    default:
      return { label: "Em análise", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  }
}

function statusBadge(status: string | null) {
  switch (status) {
    case "aprovado":
      return { label: "Aprovado", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    case "rejeitado":
      return { label: "Não selecionado", cls: "bg-red-500/15 text-red-400 border-red-500/30" };
    case "inscrito":
      return { label: "Inscrito", cls: "bg-primary/15 text-primary border-primary/30" };
    default:
      return { label: status ?? "—", cls: "bg-bg3 text-muted-foreground border-border" };
  }
}

export function DesempenhoTab() {
  const fetchDesempenho = useServerFn(getMeuDesempenho);
  const [items, setItems] = useState<PeneiraDesempenho[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDesempenho()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e: Error) => {
        if (!cancelled) toast.error(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchDesempenho]);

  const allAvals = useMemo(
    () => (items ?? []).flatMap((g) => g.avaliacoes),
    [items],
  );

  const radarAvg = useMemo(() => {
    return ATTR_LABELS.map(({ key, label }) => {
      const vals = allAvals
        .map((a) => a[key] as number | null)
        .filter((v): v is number => v != null);
      const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      return { attr: label, value: Number(avg.toFixed(2)) };
    });
  }, [allAvals]);

  const evolucao = useMemo(() => {
    return allAvals
      .filter((a) => a.nota_geral != null)
      .map((a) => ({
        data: formatDate(a.created_at),
        nota: Number(a.nota_geral),
        ts: new Date(a.created_at).getTime(),
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [allAvals]);

  const decisoes = useMemo(() => {
    const c = { aprovado: 0, em_analise: 0, rejeitado: 0 };
    allAvals.forEach((a) => {
      if (a.decisao === "aprovado") c.aprovado += 1;
      else if (a.decisao === "rejeitado") c.rejeitado += 1;
      else c.em_analise += 1;
    });
    return [
      { nome: "Aprovado", total: c.aprovado, fill: "hsl(142 71% 45%)" },
      { nome: "Em análise", total: c.em_analise, fill: "hsl(38 92% 50%)" },
      { nome: "Rejeitado", total: c.rejeitado, fill: "hsl(0 84% 60%)" },
    ];
  }, [allAvals]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-display text-lg font-extrabold">
          Você ainda não participou de peneiras
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Inscreva-se em uma peneira pelo Pelé Next Gen para começar a receber feedback dos olheiros.
        </p>
        <Button asChild className="mt-5">
          <Link to="/peneiras">Explorar peneiras</Link>
        </Button>
      </div>
    );
  }

  const totalPeneiras = items.length;
  const aprovacoes = items.filter((i) => i.status === "aprovado").length;
  const notas = allAvals.map((a) => a.nota_geral).filter((v): v is number => v != null);
  const notaMedia = notas.length
    ? (notas.reduce((s, v) => s + v, 0) / notas.length).toFixed(1)
    : "—";
  const totalAvals = allAvals.length;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={Trophy} label="Peneiras" value={String(totalPeneiras)} />
        <SummaryCard icon={Award} label="Aprovações" value={String(aprovacoes)} />
        <SummaryCard icon={Target} label="Nota média" value={String(notaMedia)} />
        <SummaryCard icon={MessageSquare} label="Avaliações" value={String(totalAvals)} />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Perfil médio">
          {allAvals.length === 0 ? (
            <EmptyChart text="Sem avaliações ainda" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarAvg} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="attr"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Evolução das notas">
          {evolucao.length === 0 ? (
            <EmptyChart text="Sem notas registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={evolucao} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="data"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="nota"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Distribuição de decisões" className="lg:col-span-2">
          {allAvals.length === 0 ? (
            <EmptyChart text="Sem decisões ainda" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={decisoes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="nome"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Lista de peneiras */}
      <div>
        <h3 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Histórico de peneiras
        </h3>
        <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
        <ul className="mt-4 space-y-3">
          {items.map((it, idx) => {
            const key = it.candidato_id ?? `orphan-${idx}`;
            const open = expanded[key] ?? false;
            const st = statusBadge(it.status);
            return (
              <li
                key={key}
                className="rounded-2xl border border-border bg-card shadow-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((p) => ({ ...p, [key]: !open }))
                  }
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-extrabold leading-tight">
                      {it.peneira?.titulo ?? "Avaliação avulsa"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      {it.peneira?.clube_nome && (
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> {it.peneira.clube_nome}
                        </span>
                      )}
                      {it.peneira?.data && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(it.peneira.data)}
                        </span>
                      )}
                      {it.peneira?.local && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {it.peneira.local}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {it.status && (
                      <Badge variant="outline" className={st.cls}>
                        {st.label}
                      </Badge>
                    )}
                    {it.nota_geral_candidato != null && (
                      <span className="font-display text-lg font-extrabold text-primary">
                        {Number(it.nota_geral_candidato).toFixed(1)}
                      </span>
                    )}
                    {open ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-border p-4">
                    {it.avaliacoes.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground">
                        Ainda não há feedback do olheiro para esta peneira.
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {it.avaliacoes.map((a) => (
                          <AvaliacaoBlock key={a.id} a={a} />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AvaliacaoBlock({ a }: { a: AvaliacaoItem }) {
  const dec = decisaoBadge(a.decisao);
  const radarData = ATTR_LABELS.map(({ key, label }) => ({
    attr: label,
    value: (a[key] as number | null) ?? 0,
  }));
  return (
    <li className="rounded-xl border border-border bg-bg2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          {a.avaliador_nome ? `Olheiro: ${a.avaliador_nome} · ` : ""}
          {formatDate(a.created_at)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={dec.cls}>
            {dec.label}
          </Badge>
          {a.nota_geral != null && (
            <span className="font-display text-base font-extrabold text-primary">
              {Number(a.nota_geral).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="attr"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {ATTR_LABELS.map(({ key, label }) => {
              const v = a[key] as number | null;
              return (
                <div key={key} className="rounded-lg border border-border bg-bg3 px-2 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="font-display text-sm font-extrabold">
                    {v != null ? Number(v).toFixed(1) : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(a.tags_positivas?.length ?? 0) > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <Plus className="mr-1 inline h-3 w-3" />
            Pontos fortes
          </p>
          <div className="flex flex-wrap gap-1">
            {a.tags_positivas!.map((t) => (
              <span
                key={t}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {(a.tags_negativas?.length ?? 0) > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
            <Minus className="mr-1 inline h-3 w-3" />A melhorar
          </p>
          <div className="flex flex-wrap gap-1">
            {a.tags_negativas!.map((t) => (
              <span
                key={t}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {a.comentario && (
        <div className="mt-3 rounded-lg border border-border bg-bg3 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Comentário do olheiro
          </p>
          <p className="whitespace-pre-wrap text-sm text-foreground/90">{a.comentario}</p>
        </div>
      )}
    </li>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className ?? ""}`}
    >
      <h3 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
        {title}
      </h3>
      <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
