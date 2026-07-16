import { useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Activity, Sparkles, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SKILL_KEYS, SKILL_LABELS, parseSkills, type SkillsMap } from "@/lib/skills";

interface Props {
  atletaId: string;
  self: SkillsMap;
  validated?: SkillsMap | null;
}

interface PercentileRow {
  skill: string;
  value: number | null;
  percentile: number | null;
  peer_count: number;
  avg_value: number | null;
}

interface HistoryRow {
  created_at: string;
  source: "self" | "validated";
  skills: Record<string, number>;
}

export function SkillsInsights({ atletaId, self, validated }: Props) {
  const [percentiles, setPercentiles] = useState<PercentileRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      (supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: PercentileRow[] | null }>)(
        "get_athlete_skill_percentiles",
        { _atleta: atletaId },
      ),
      supabase
        .from("athlete_skill_history")
        .select("created_at, source, skills")
        .eq("atleta_id", atletaId)
        .order("created_at", { ascending: true })
        .limit(50),
    ]).then(([pctRes, histRes]) => {
      if (cancelled) return;
      setPercentiles(pctRes.data ?? []);
      setHistory(
        ((histRes.data as unknown as HistoryRow[]) ?? []).map((r) => ({
          ...r,
          skills: (r.skills ?? {}) as Record<string, number>,
        })),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  const radarData = useMemo(() => {
    const v = validated ?? {};
    return SKILL_KEYS.map((k) => ({
      criterio: SKILL_LABELS[k],
      auto: self[k] ?? 0,
      validado: v[k] ?? null,
    }));
  }, [self, validated]);

  const hasValidated = SKILL_KEYS.some((k) => (validated ?? {})[k] != null);

  const evolutionData = useMemo(() => {
    // Build one line per skill (using validated when present, else self entries)
    const entries = history.filter((h) => h.skills && Object.keys(h.skills).length);
    return entries.map((h) => {
      const parsed = parseSkills(h.skills);
      const dt = new Date(h.created_at);
      const row: Record<string, string | number | null> = {
        date: dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      };
      for (const k of SKILL_KEYS) row[SKILL_LABELS[k]] = parsed[k] ?? null;
      return row;
    });
  }, [history]);

  const avgPercentile = useMemo(() => {
    const vals = percentiles.map((p) => p.percentile).filter((n): n is number => n != null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [percentiles]);

  return (
    <div className="space-y-4">
      {/* RADAR */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-4 w-4" /> Perfil de habilidades
          </h2>
          {hasValidated && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
              Auto vs Validado
            </span>
          )}
        </div>
        <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
        <div className="mt-4 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="criterio"
                tick={{ fill: "#e8ecf2", fontSize: 11 }}
              />
              <Radar
                name="Autoavaliação"
                dataKey="auto"
                stroke="#4a90e2"
                fill="#4a90e2"
                fillOpacity={0.25}
                strokeWidth={2}
                animationDuration={600}
              />
              {hasValidated && (
                <Radar
                  name="Validado"
                  dataKey="validado"
                  stroke="#d4af37"
                  fill="#d4af37"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  animationDuration={800}
                />
              )}
              {hasValidated && (
                <Legend wrapperStyle={{ fontSize: 11, color: "#e8ecf2" }} />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* PERCENTIS */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
          <Users className="h-4 w-4" /> Comparativo por posição
          {avgPercentile != null && (
            <span className="ml-auto rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Média: top {100 - avgPercentile}%
            </span>
          )}
        </h2>
        <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />

        {loading ? (
          <p className="mt-4 text-sm italic text-muted-foreground">Calculando…</p>
        ) : percentiles.every((p) => p.percentile == null) ? (
          <p className="mt-4 text-sm italic text-muted-foreground">
            Ainda não há atletas suficientes na sua posição para comparar.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {percentiles.map((p) => {
              const label = SKILL_LABELS[p.skill as keyof typeof SKILL_LABELS] ?? p.skill;
              const pct = p.percentile;
              return (
                <li key={p.skill}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {pct != null ? (
                        <>
                          <span className="font-display font-bold text-primary">
                            Top {Math.max(1, 100 - pct)}%
                          </span>
                          {p.avg_value != null && (
                            <span className="ml-2 opacity-70">
                              (média {p.avg_value})
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-bg3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary"
                      style={{ width: `${pct ?? 0}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* EVOLUÇÃO */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
          <TrendingUp className="h-4 w-4" /> Evolução ao longo do tempo
        </h2>
        <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
        {evolutionData.length < 2 ? (
          <p className="mt-4 flex items-center gap-2 text-sm italic text-muted-foreground">
            <Activity className="h-4 w-4" />
            Atualize suas habilidades ao longo do tempo para ver a evolução aqui.
          </p>
        ) : (
          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: "#e8ecf2", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#e8ecf2", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f1520",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: "#e8ecf2" }} />
                {SKILL_KEYS.map((k, i) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={SKILL_LABELS[k]}
                    stroke={LINE_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                    animationDuration={500}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

const LINE_COLORS = ["#d4af37", "#4a90e2", "#e94560", "#4ade80", "#a78bfa"];
