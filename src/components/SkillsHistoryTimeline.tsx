import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SKILL_KEYS, SKILL_LABELS, type SkillKey } from "@/lib/skills";

interface HistoryRow {
  id: string;
  created_at: string;
  source: "self" | "validated";
  validator_id: string | null;
  validator_name: string | null;
  skills: Record<string, number>;
}

/**
 * Chronological audit trail of skill changes for an athlete.
 * Shows each entry with source (self / validated), validator, and diff.
 */
export function SkillsHistoryTimeline({ atletaId }: { atletaId: string }) {
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Cast: RPC is not in the generated types yet.
    (supabase.rpc as (fn: string, args: unknown) => Promise<{ data: unknown; error: { message: string } | null }>)(
      "get_athlete_skill_history",
      { _atleta: atletaId },
    )
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setRows([]);
          return;
        }
        setRows((data as HistoryRow[] | null) ?? []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Ainda não há histórico de alterações de habilidades.
      </div>
    );
  }

  // Build diffs vs previous entry.
  const entries = rows.map((r, i) => {
    const prev = rows[i - 1];
    const diffs: { key: SkillKey; from: number | null; to: number; delta: number }[] = [];
    for (const k of SKILL_KEYS) {
      const to = r.skills?.[k];
      if (to == null) continue;
      const from = prev?.skills?.[k] ?? null;
      if (from === to) continue;
      diffs.push({ key: k, from, to, delta: from == null ? to : to - from });
    }
    return { row: r, diffs };
  });

  return (
    <ol className="relative space-y-4 border-l-2 border-primary/20 pl-6">
      {entries
        .slice()
        .reverse()
        .map(({ row, diffs }) => {
          const validated = row.source === "validated";
          return (
            <li key={row.id} className="relative">
              <span
                className={
                  "absolute -left-[35px] top-2 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background " +
                  (validated ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                }
              >
                {validated ? <ShieldCheck className="h-3.5 w-3.5" /> : <User2 className="h-3.5 w-3.5" />}
              </span>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-sm font-extrabold">
                    {validated ? "Validação" : "Autoavaliação"}
                    {validated && row.validator_name ? (
                      <span className="ml-1 text-muted-foreground font-normal">
                        por {row.validator_name}
                      </span>
                    ) : null}
                  </p>
                  <time className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("pt-BR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
                {diffs.length === 0 ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    Sem mudanças em relação ao registro anterior.
                  </p>
                ) : (
                  <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {diffs.map((d) => (
                      <li key={d.key} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">{SKILL_LABELS[d.key]}</span>
                        <span className="font-mono font-semibold">
                          {d.from ?? "—"} → {d.to}
                          <span
                            className={
                              "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                              (d.delta > 0
                                ? "bg-success/15 text-success"
                                : d.delta < 0
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-muted text-muted-foreground")
                            }
                          >
                            {d.delta > 0 ? `+${d.delta}` : d.delta}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
    </ol>
  );
}
