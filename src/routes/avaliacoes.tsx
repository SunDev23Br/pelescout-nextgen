import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
  RotateCcw,
  Zap,
  Brain,
  Dumbbell,
  Heart,
  Flame,
  Timer,
  Save,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcularIdade } from "@/lib/date";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { QuickScoreSelector } from "@/components/evaluation/QuickScoreSelector";
import { RadarPreview } from "@/components/evaluation/RadarPreview";
import { TagSelector } from "@/components/evaluation/TagSelector";
import { ScoutComment } from "@/components/evaluation/ScoutComment";
import { AutoSummary } from "@/components/evaluation/AutoSummary";
import { OverallRating } from "@/components/evaluation/OverallRating";
import { EvaluationCard } from "@/components/evaluation/EvaluationCard";
import {
  FootProfile,
  EMPTY_FOOT_DATA,
  computeFootBonus,
  type FootData,
} from "@/components/evaluation/FootProfile";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliação ao Vivo — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Avalie atletas em tempo real durante peneiras, jogos e treinos.",
      },
    ],
  }),
  component: AvaliacoesPage,
});

type Scores = {
  tecnica: number;
  tatica: number;
  fisica: number;
  mental: number;
  intensidade: number;
};

type Decision = "aprovado" | "reprovado" | "reavaliar";

interface PeneiraRow {
  id: string;
  titulo: string;
}

interface AtletaRow {
  id: string;
  nome: string;
  posicao: string | null;
  dataNascimento: string | null;
  avatar: string | null;
}

const ALL_ATLETAS = "__all__";

function AvaliacoesPage() {
  const { user, ready } = useSession();
  if (ready && user?.role === "clube") {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-extrabold">Acesso restrito</h1>
          <p className="mt-2 text-muted-foreground">
            A avaliação ao vivo não está disponível para clubes.
          </p>
        </div>
      </AppLayout>
    );
  }
  return <AvaliacoesPageInner />;
}

function AvaliacoesPageInner() {
  // ---- Data: peneiras + atletas ----
  const [peneiras, setPeneiras] = useState<PeneiraRow[]>([]);
  const [loadingPeneiras, setLoadingPeneiras] = useState(true);
  const [peneiraId, setPeneiraId] = useState<string>(ALL_ATLETAS);

  const [atletas, setAtletas] = useState<AtletaRow[]>([]);
  const [loadingAtletas, setLoadingAtletas] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("peneiras")
      .select("id, titulo")
      .order("data", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message);
        setPeneiras((data ?? []) as PeneiraRow[]);
        setLoadingPeneiras(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingAtletas(true);
    const loader = async () => {
      if (peneiraId === ALL_ATLETAS) {
        // todos os atletas cadastrados (role=atleta)
        const { data: roles, error: rErr } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "atleta");
        if (rErr) {
          toast.error(rErr.message);
          if (!cancelled) {
            setAtletas([]);
            setLoadingAtletas(false);
          }
          return;
        }
        const ids = (roles ?? []).map((r) => r.user_id);
        if (ids.length === 0) {
          if (!cancelled) {
            setAtletas([]);
            setLoadingAtletas(false);
          }
          return;
        }
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nome, posicao, data_nascimento, avatar_url")
          .in("id", ids)
          .order("nome", { ascending: true });
        if (error) toast.error(error.message);
        if (!cancelled) {
          setAtletas(
            (data ?? []).map((p) => ({
              id: p.id,
              nome: p.nome,
              posicao: p.posicao as string | null,
              dataNascimento: p.data_nascimento as string | null,
              avatar: p.avatar_url as string | null,
            })),
          );
          setLoadingAtletas(false);
        }
      } else {
        const { data, error } = await supabase
          .from("candidatos")
          .select("id, nome, posicao, data_nascimento, avatar")
          .eq("peneira_id", peneiraId)
          .order("nome", { ascending: true });
        if (error) toast.error(error.message);
        if (!cancelled) {
          setAtletas(
            (data ?? []).map((c) => ({
              id: c.id,
              nome: c.nome,
              posicao: c.posicao as string | null,
              dataNascimento: c.data_nascimento as string | null,
              avatar: c.avatar as string | null,
            })),
          );
          setLoadingAtletas(false);
        }
      }
    };
    void loader();
    return () => {
      cancelled = true;
    };
  }, [peneiraId]);

  useEffect(() => {
    setSelectedId(atletas[0]?.id ?? "");
  }, [atletas]);

  const selected = useMemo(
    () => atletas.find((c) => c.id === selectedId) ?? atletas[0],
    [atletas, selectedId],
  );

  // ---- Avaliação state ----
  const [scores, setScores] = useState<Scores>({
    tecnica: 0,
    tatica: 0,
    fisica: 0,
    mental: 0,
    intensidade: 0,
  });
  const updateScore = useCallback((key: keyof Scores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  }, []);

  const [positiveTags, setPositiveTags] = useState<string[]>([]);
  const [negativeTags, setNegativeTags] = useState<string[]>([]);
  const togglePositive = useCallback((tag: string) => {
    setPositiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);
  const toggleNegative = useCallback((tag: string) => {
    setNegativeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const [comentario, setComentario] = useState("");

  const [footData, setFootData] = useState<FootData>(EMPTY_FOOT_DATA);
  const footBonus = useMemo(() => computeFootBonus(footData), [footData]);

  const [decisoes, setDecisoes] = useState<Record<string, Decision>>({});
  const decisaoSel = selected ? decisoes[selected.id] : undefined;

  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(timer);
  }, [startTime]);
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h.toString().padStart(2, "0")}:${(m % 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!selected) return;
    const timeout = setTimeout(() => {
      setSaving(true);
      setTimeout(() => setSaving(false), 800);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [scores, positiveTags, negativeTags, comentario, footData, selected]);

  useEffect(() => {
    setScores({ tecnica: 0, tatica: 0, fisica: 0, mental: 0, intensidade: 0 });
    setPositiveTags([]);
    setNegativeTags([]);
    setComentario("");
    setFootData(EMPTY_FOOT_DATA);
  }, [selectedId]);

  function decidir(decisao: Decision) {
    if (!selected) return;
    setDecisoes((d) => ({ ...d, [selected.id]: decisao }));
    const messages: Record<Decision, string> = {
      aprovado: "Atleta aprovado!",
      reprovado: "Atleta reprovado.",
      reavaliar: "Atleta marcado para reavaliação.",
    };
    toast.success(messages[decisao], {
      description: `Decisão registrada para ${selected.nome}.`,
    });
  }

  function salvar() {
    if (!selected) return;
    const avg =
      (scores.tecnica +
        scores.tatica +
        scores.fisica +
        scores.mental +
        scores.intensidade) /
      5;
    toast.success(`Avaliação salva para ${selected.nome}`, {
      description: `Nota geral: ${avg.toFixed(1)}`,
    });
  }

  const idadeAtleta = selected?.dataNascimento
    ? calcularIdade(selected.dataNascimento)
    : 0;

  return (
    <AppLayout>
      {/* Compact header */}
      <header className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Avaliação ao vivo
            </p>
            <h1 className="font-display text-xl font-extrabold sm:text-2xl">
              Avaliação em Tempo Real
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5">
              <Timer className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-mono font-bold text-primary">
                {formatTime(elapsed)}
              </span>
            </div>
            {saving && (
              <div className="flex items-center gap-1 text-[10px] text-success animate-fade-in">
                <Save className="h-3 w-3" /> Salvo
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Peneira selector */}
      <div className="mb-4">
        <Select value={peneiraId} onValueChange={(v) => setPeneiraId(v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Selecione uma peneira" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ATLETAS}>
              Todos os atletas cadastrados
            </SelectItem>
            {loadingPeneiras ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Carregando peneiras…
              </div>
            ) : (
              peneiras.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.titulo}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Athlete list */}
        <aside className="rounded-2xl border border-border bg-card p-2 shadow-card lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto">
          <p className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Atletas ({atletas.length})
          </p>
          {loadingAtletas ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {atletas.map((c) => {
                const active = selected?.id === c.id;
                const dec = decisoes[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-all duration-150",
                      active
                        ? "bg-primary/15 text-foreground"
                        : "hover:bg-bg2",
                    )}
                  >
                    <AthleteAvatar
                      src={c.avatar ?? undefined}
                      alt={c.nome}
                      className="h-8 w-8 border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{c.nome}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.posicao ?? "—"}
                        {c.dataNascimento
                          ? ` · ${calcularIdade(c.dataNascimento)}a`
                          : ""}
                      </p>
                    </div>
                    {dec === "aprovado" && (
                      <ThumbsUp className="h-3.5 w-3.5 text-success" />
                    )}
                    {dec === "reprovado" && (
                      <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                    {dec === "reavaliar" && (
                      <RotateCcw className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                );
              })}
              {atletas.length === 0 && (
                <p className="px-2 py-6 text-center text-[10px] text-muted-foreground">
                  {peneiraId === ALL_ATLETAS
                    ? "Nenhum atleta cadastrado ainda."
                    : "Nenhum inscrito nesta peneira."}
                </p>
              )}
            </div>
          )}
        </aside>

        {/* Evaluation panel */}
        {selected ? (
          <div className="space-y-3 animate-fade-in">
            <div className="grid gap-3 grid-cols-[1fr_auto]">
              <EvaluationCard
                nome={selected.nome}
                posicao={selected.posicao ?? "—"}
                idade={idadeAtleta}
                avatar={selected.avatar ?? undefined}
              />
              <OverallRating scores={scores} bonus={footBonus} />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => decidir("aprovado")}
                size="sm"
                className={cn(
                  "flex-1 transition-all",
                  decisaoSel === "aprovado"
                    ? "bg-success text-primary-foreground shadow-lg"
                    : "bg-success/20 text-success hover:bg-success/30 border border-success/30",
                )}
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" /> Aprovar
              </Button>
              <Button
                onClick={() => decidir("reprovado")}
                size="sm"
                className={cn(
                  "flex-1 transition-all",
                  decisaoSel === "reprovado"
                    ? "bg-destructive text-destructive-foreground shadow-lg"
                    : "bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30",
                )}
              >
                <ThumbsDown className="mr-1.5 h-4 w-4" /> Reprovar
              </Button>
              <Button
                onClick={() => decidir("reavaliar")}
                size="sm"
                className={cn(
                  "flex-1 transition-all",
                  decisaoSel === "reavaliar"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30",
                )}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" /> Reavaliar
              </Button>
            </div>

            <div className="space-y-1.5">
              <QuickScoreSelector
                label="Técnica"
                icon={<Zap className="h-4 w-4" />}
                value={scores.tecnica}
                onChange={(v) => updateScore("tecnica", v)}
              />
              <QuickScoreSelector
                label="Tática"
                icon={<Brain className="h-4 w-4" />}
                value={scores.tatica}
                onChange={(v) => updateScore("tatica", v)}
              />
              <QuickScoreSelector
                label="Física"
                icon={<Dumbbell className="h-4 w-4" />}
                value={scores.fisica}
                onChange={(v) => updateScore("fisica", v)}
              />
              <QuickScoreSelector
                label="Mental"
                icon={<Heart className="h-4 w-4" />}
                value={scores.mental}
                onChange={(v) => updateScore("mental", v)}
              />
              <QuickScoreSelector
                label="Intensidade"
                icon={<Flame className="h-4 w-4" />}
                value={scores.intensidade}
                onChange={(v) => updateScore("intensidade", v)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <RadarPreview scores={scores} />
              <TagSelector
                selectedPositive={positiveTags}
                selectedNegative={negativeTags}
                onTogglePositive={togglePositive}
                onToggleNegative={toggleNegative}
              />
            </div>

            <FootProfile data={footData} onChange={setFootData} />

            <AutoSummary
              scores={scores}
              positiveTags={positiveTags}
              negativeTags={negativeTags}
              foot={footData}
            />

            <ScoutComment value={comentario} onChange={setComentario} />

            <Button onClick={salvar} size="lg" className="w-full shadow-gold">
              <Save className="mr-2 h-5 w-5" /> Salvar Avaliação
              {decisaoSel && <CheckCircle2 className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {loadingAtletas
                ? "Carregando atletas…"
                : "Selecione uma peneira ou cadastre atletas para começar a avaliar."}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
