import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, ShieldCheck, Filter } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { supabase } from "@/integrations/supabase/client";
import { BR_STATES } from "@/lib/br-states";

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];
const SKILLS = [
  { key: "", label: "Média geral" },
  { key: "marcacao", label: "Marcação" },
  { key: "forca", label: "Força" },
  { key: "passe", label: "Passe" },
  { key: "velocidade", label: "Velocidade" },
  { key: "posicionamento", label: "Posicionamento" },
];

interface Row {
  rank: number;
  id: string;
  nome: string;
  avatar_url: string | null;
  posicao: string | null;
  cidade: string | null;
  score: number | null;
  is_validated: boolean;
}

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking de atletas — PeleScout" },
      { name: "description", content: "Leaderboard de atletas por posição, cidade e habilidade." },
      { property: "og:title", content: "Ranking de atletas — PeleScout" },
      { property: "og:url", content: "https://pelescout-nextgen.lovable.app/ranking" },
    ],
    links: [{ rel: "canonical", href: "https://pelescout-nextgen.lovable.app/ranking" }],
  }),
  component: RankingPage,
});

function RankingPage() {
  const [posicao, setPosicao] = useState("");
  const [cidade, setCidade] = useState("");
  const [skill, setSkill] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_athlete_leaderboard", {
        _posicao: posicao || undefined,
        _cidade: cidade || undefined,
        _skill: skill || undefined,
        _limit: 50,
      });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [posicao, cidade, skill]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Trophy className="h-7 w-7 text-primary" />
            Ranking de atletas
          </h1>
          <p className="text-sm text-muted-foreground">
            Classificação por habilidades — filtre por posição, cidade e skill específica.
          </p>
        </header>

        <div className="grid gap-3 rounded-2xl border border-border bg-bg2 p-4 sm:grid-cols-3">
          <label className="text-xs font-semibold text-muted-foreground">
            <span className="mb-1 flex items-center gap-1"><Filter className="h-3 w-3" /> Posição</span>
            <select
              value={posicao}
              onChange={(e) => setPosicao(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Todas</option>
              {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            <span className="mb-1 block">Cidade / UF</span>
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex.: São Paulo ou SP"
              list="uf-list"
              className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
            />
            <datalist id="uf-list">
              {BR_STATES.map((s) => <option key={s.uf} value={s.uf}>{s.nome}</option>)}
            </datalist>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            <span className="mb-1 block">Habilidade</span>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
            >
              {SKILLS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-bg2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Carregando ranking…</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Nenhum atleta com dados suficientes ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-4 py-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    r.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                    r.rank === 2 ? "bg-slate-400/20 text-slate-300" :
                    r.rank === 3 ? "bg-amber-700/20 text-amber-500" :
                    "bg-bg3 text-muted-foreground"
                  }`}>
                    {r.rank}
                  </span>
                  <AthleteAvatar src={r.avatar_url ?? undefined} alt={r.nome} className="h-11 w-11 border border-border" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to="/a/$atletaId" params={{ atletaId: r.id }} className="truncate text-sm font-semibold hover:text-primary">
                        {r.nome}
                      </Link>
                      {r.is_validated && (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-label="Validado" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.posicao ?? "—"} {r.cidade ? `• ${r.cidade}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{r.score ?? "—"}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">pontos</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
