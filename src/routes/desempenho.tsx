import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  LineChart as LineChartIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { fromISODate } from "@/lib/date";

export const Route = createFileRoute("/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Acompanhe suas peneiras anteriores e o feedback dos olheiros.",
      },
    ],
  }),
  component: DesempenhoPage,
});

interface AvaliacaoRow {
  id: string;
  candidato_id: string | null;
  peneira_id: string | null;
  tecnica: number | null;
  fisico: number | null;
  tatico: number | null;
  mental: number | null;
  intensidade: number | null;
  pe_bonus: number | null;
  nota_geral: number | null;
  decisao: string | null;
  tags_positivas: string[] | null;
  tags_negativas: string[] | null;
  comentario: string | null;
  created_at: string;
  avaliador_id: string | null;
  atleta_user_id?: string | null;
}

interface CandidatoRow {
  id: string;
  status: string | null;
  nota_geral: number | null;
  peneira: {
    id: string;
    titulo: string;
    data: string | null;
    local: string | null;
    cidade: string | null;
    estado: string | null;
    organizador: string | null;
  } | null;
}

interface Grupo {
  key: string;
  candidatoId: string | null;
  peneira: {
    titulo: string;
    data: string | null;
    local: string | null;
    organizador: string | null;
  } | null;
  status: string | null;
  notaCandidato: number | null;
  avaliacoes: (AvaliacaoRow & { avaliadorNome: string | null })[];
}

const ATTR: { key: keyof AvaliacaoRow; label: string }[] = [
  { key: "tecnica", label: "Técnico" },
  { key: "fisico", label: "Físico" },
  { key: "tatico", label: "Tático" },
  { key: "mental", label: "Mental" },
  { key: "intensidade", label: "Intensidade" },
  { key: "pe_bonus", label: "Pé" },
];

function fmtDate(iso: string | null) {
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

function DesempenhoPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "atleta") navigate({ to: "/perfil" });
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "atleta") {
    return (
      <AppLayout>
        <div className="h-64" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Zap className="h-3 w-3" /> Meu desempenho
          </span>
          <h1 className="mt-3 flex items-center gap-2 font-display text-2xl font-extrabold sm:text-3xl">
            <LineChartIcon className="h-6 w-6 text-primary" /> Desempenho
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico das peneiras que você participou e o feedback dos olheiros.
          </p>
        </header>

        <DesempenhoContent userId={user.id} />
      </div>
    </AppLayout>
  );
}

function DesempenhoContent({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // 1) Candidaturas do atleta
        const { data: candData, error: candErr } = await supabase
          .from("candidatos")
          .select(
            "id, status, nota_geral, peneira:peneiras(id, titulo, data, local, cidade, estado, organizador)",
          )
          .eq("user_id", userId);
        if (candErr) throw candErr;
        const candidatos = (candData ?? []) as unknown as CandidatoRow[];
        const candidatoIds = candidatos.map((c) => c.id);

        // 2) Avaliações ligadas às candidaturas do atleta.
        // Mantemos a consulta somente por candidato_id para evitar chamar colunas
        // opcionais de versões antigas do banco e impedir queda da página.
        let avals: AvaliacaoRow[] = [];
        if (candidatoIds.length > 0) {
          const { data: avalData, error: avalErr } = await supabase
            .from("avaliacoes")
            .select(
              "id, candidato_id, peneira_id, tecnica, fisico, tatico, mental, intensidade, pe_bonus, nota_geral, decisao, tags_positivas, tags_negativas, comentario, created_at, avaliador_id",
            )
            .in("candidato_id", candidatoIds);
          if (avalErr) throw avalErr;
          avals = (avalData ?? []) as AvaliacaoRow[];
        }

        // 3) Nomes dos avaliadores
        const avaliadorIds = Array.from(
          new Set(avals.map((a) => a.avaliador_id).filter((v): v is string => !!v)),
        );
        const nomeMap = new Map<string, string>();
        if (avaliadorIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, nome")
            .in("id", avaliadorIds);
          (profs ?? []).forEach((p: { id: string; nome: string | null }) => {
            nomeMap.set(p.id, p.nome ?? "Olheiro");
          });
        }

        // 4) Peneiras extras (avaliações sem candidato vinculado)
        const candPeneiraIds = new Set(
          candidatos.map((c) => c.peneira?.id).filter(Boolean),
        );
        const extraPeneiraIds = Array.from(
          new Set(
            avals
              .filter((a) => a.peneira_id && !candPeneiraIds.has(a.peneira_id))
              .map((a) => a.peneira_id as string),
          ),
        );
        const peneiraExtra = new Map<
          string,
          { titulo: string; data: string | null; local: string | null; organizador: string | null }
        >();
        if (extraPeneiraIds.length > 0) {
          const { data: pen } = await supabase
            .from("peneiras")
            .select("id, titulo, data, local, organizador")
            .in("id", extraPeneiraIds);
          (pen ?? []).forEach((p) => {
            peneiraExtra.set(p.id, {
              titulo: p.titulo,
              data: p.data,
              local: p.local,
              organizador: p.organizador,
            });
          });
        }

        // 5) Agrupar
        const out: Grupo[] = [];
        candidatos.forEach((c) => {
          const minha = avals
            .filter((a) => a.candidato_id === c.id)
            .map((a) => ({ ...a, avaliadorNome: a.avaliador_id ? nomeMap.get(a.avaliador_id) ?? null : null }));
          out.push({
            key: c.id,
            candidatoId: c.id,
            peneira: c.peneira
              ? {
                  titulo: c.peneira.titulo,
                  data: c.peneira.data,
                  local: c.peneira.local,
                  organizador: c.peneira.organizador,
                }
              : null,
            status: c.status,
            notaCandidato: c.nota_geral,
            avaliacoes: minha,
          });
        });

        // Ordenar por data desc
        out.sort((a, b) => {
          const da = a.peneira?.data ? new Date(a.peneira.data).getTime() : 0;
          const db = b.peneira?.data ? new Date(b.peneira.data).getTime() : 0;
          return db - da;
        });

        if (!cancelled) setGrupos(out);
      } catch (e) {
        if (!cancelled) {
          toast.error((e as Error).message || "Erro ao carregar desempenho");
          setGrupos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const todasAvals = useMemo(
    () => (grupos ?? []).flatMap((g) => g.avaliacoes),
    [grupos],
  );

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!grupos || grupos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-display text-lg font-extrabold">
          Você ainda não participou de peneiras
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Inscreva-se em uma peneira para começar a receber o feedback dos olheiros.
        </p>
        <Button asChild className="mt-5">
          <Link to="/peneiras">Explorar peneiras</Link>
        </Button>
      </div>
    );
  }

  const totalPeneiras = grupos.length;
  const aprovacoes = grupos.filter((g) => g.status === "aprovado").length;
  const notas = todasAvals.map((a) => a.nota_geral).filter((v): v is number => v != null);
  const notaMedia = notas.length
    ? (notas.reduce((s, v) => s + v, 0) / notas.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Trophy} label="Peneiras" value={String(totalPeneiras)} />
        <Stat icon={Award} label="Aprovações" value={String(aprovacoes)} />
        <Stat icon={Target} label="Nota média" value={String(notaMedia)} />
        <Stat icon={MessageSquare} label="Feedbacks" value={String(todasAvals.length)} />
      </div>

      <div>
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Histórico
        </h2>
        <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
        <ul className="mt-4 space-y-3">
          {grupos.map((g) => {
            const open = expanded[g.key] ?? false;
            const st = statusBadge(g.status);
            return (
              <li key={g.key} className="rounded-2xl border border-border bg-card shadow-card">
                <button
                  type="button"
                  onClick={() => setExpanded((p) => ({ ...p, [g.key]: !open }))}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-extrabold leading-tight">
                      {g.peneira?.titulo ?? "Avaliação avulsa"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      {g.peneira?.organizador && (
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> {g.peneira.organizador}
                        </span>
                      )}
                      {g.peneira?.data && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {fmtDate(g.peneira.data)}
                        </span>
                      )}
                      {g.peneira?.local && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {g.peneira.local}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {g.status && (
                      <Badge variant="outline" className={st.cls}>
                        {st.label}
                      </Badge>
                    )}
                    {g.notaCandidato != null && (
                      <span className="font-display text-lg font-extrabold text-primary">
                        {Number(g.notaCandidato).toFixed(1)}
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
                    {g.avaliacoes.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground">
                        Ainda não há feedback do olheiro para esta peneira.
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {g.avaliacoes.map((a) => (
                          <AvaliacaoCard key={a.id} a={a} />
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

function AvaliacaoCard({
  a,
}: {
  a: AvaliacaoRow & { avaliadorNome: string | null };
}) {
  const dec = decisaoBadge(a.decisao);
  return (
    <li className="rounded-xl border border-border bg-bg2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          {a.avaliadorNome ? `Olheiro: ${a.avaliadorNome} · ` : ""}
          {fmtDate(a.created_at)}
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

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ATTR.map(({ key, label }) => {
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

function Stat({
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
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
