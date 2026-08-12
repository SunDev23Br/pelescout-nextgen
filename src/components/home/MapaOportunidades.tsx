import { useMemo, useState } from "react";
import type { Peneira } from "@/lib/mock-data";
import { BR_STATE_PATHS, BR_VIEWBOX } from "@/lib/br-map-paths";
import { Eyebrow, Reveal } from "./Reveal";
import { AuthLink } from "./AuthLink";

const [, , VB_W, VB_H] = BR_VIEWBOX.split(" ").map(Number);

export function MapaOportunidades({ peneiras }: { peneiras: Peneira[] }) {
  const [ativoUf, setAtivoUf] = useState<string | null>(null);

  const porUf = useMemo(() => {
    const m = new Map<string, number>();
    peneiras
      .filter((p) => p.status !== "encerrada")
      .forEach((p) => m.set(p.estado, (m.get(p.estado) ?? 0) + 1));
    return m;
  }, [peneiras]);

  const max = useMemo(
    () => Math.max(1, ...[...porUf.values()]),
    [porUf],
  );

  const top = useMemo(
    () => [...porUf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    [porUf],
  );

  const totalAtivas = useMemo(
    () => [...porUf.values()].reduce((s, n) => s + n, 0),
    [porUf],
  );

  const estadoAtivo = BR_STATE_PATHS.find((s) => s.uf === ativoUf);
  const nAtivo = ativoUf ? (porUf.get(ativoUf) ?? 0) : 0;

  return (
    <section
      id="mapa"
      className="scroll-mt-16 border-y border-border bg-bg2/40"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-10 lg:py-32">
        <Reveal>
          <Eyebrow>Mapa de oportunidades</Eyebrow>
          <h2 className="mt-6 max-w-md font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            O talento está espalhado. A avaliação também.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Os estados destacados em dourado têm peneiras ativas cadastradas
            agora —{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {totalAtivas}
            </span>{" "}
            no total. O mapa é atualizado automaticamente conforme novas
            peneiras entram no sistema.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {top.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Novas regiões em breve.
              </p>
            ) : (
              top.map(([uf, n]) => (
                <button
                  key={uf}
                  type="button"
                  onMouseEnter={() => setAtivoUf(uf)}
                  onMouseLeave={() => setAtivoUf(null)}
                  onFocus={() => setAtivoUf(uf)}
                  onBlur={() => setAtivoUf(null)}
                  className={`rounded-xl border-t px-2 pb-2 pt-3 text-left transition-all ${
                    ativoUf === uf
                      ? "-translate-y-0.5 border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    {uf}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums text-primary">
                    {String(n).padStart(2, "0")}
                  </dd>
                </button>
              ))
            )}
          </dl>
        </Reveal>

        <Reveal delay={140}>
          <div className="relative mx-auto w-full max-w-[34rem]">
            <svg
              viewBox={BR_VIEWBOX}
              className="h-auto w-full"
              role="img"
              aria-label="Mapa do Brasil com os estados que têm peneiras ativas"
            >
              {BR_STATE_PATHS.map((s) => {
                const n = porUf.get(s.uf) ?? 0;
                const ativo = n > 0;
                const destaque = ativoUf === s.uf;
                const intensidade = ativo ? 0.25 + (n / max) * 0.6 : 0;
                return (
                  <path
                    key={s.uf}
                    d={s.d}
                    onMouseEnter={() => setAtivoUf(s.uf)}
                    onMouseLeave={() => setAtivoUf(null)}
                    className={`transition-all duration-200 ${
                      ativo ? "cursor-pointer" : ""
                    }`}
                    style={{
                      fill: ativo
                        ? `color-mix(in oklab, var(--gold) ${
                            (destaque ? 1 : intensidade) * 100
                          }%, transparent)`
                        : "color-mix(in oklab, var(--foreground) 7%, transparent)",
                      stroke: destaque
                        ? "var(--gold-light)"
                        : "color-mix(in oklab, var(--foreground) 22%, transparent)",
                      strokeWidth: destaque ? 3 : 1.2,
                      strokeLinejoin: "round",
                    }}
                  />
                );
              })}

              {BR_STATE_PATHS.filter((s) => (porUf.get(s.uf) ?? 0) > 0).map(
                (s) => (
                  <text
                    key={`l-${s.uf}`}
                    x={s.cx}
                    y={s.cy + 6}
                    textAnchor="middle"
                    pointerEvents="none"
                    className="fill-foreground text-[20px] font-bold tracking-[0.06em]"
                  >
                    {s.uf}
                  </text>
                ),
              )}
            </svg>

            {estadoAtivo && (
              <div
                className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-xl border border-primary/40 bg-background/95 px-3 py-2 shadow-xl backdrop-blur"
                style={{
                  left: `${(estadoAtivo.cx / VB_W) * 100}%`,
                  top: `${(estadoAtivo.cy / VB_H) * 100 - 1}%`,
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  {estadoAtivo.nome}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {nAtivo > 0
                    ? `${nAtivo} peneira${nAtivo > 1 ? "s" : ""} ativa${nAtivo > 1 ? "s" : ""}`
                    : "Sem peneiras no momento"}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-primary" /> Com peneiras
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-foreground/10" /> Em breve
              </span>
              <AuthLink
                href="/peneiras"
                className="font-bold text-primary underline-offset-4 hover:underline"
              >
                Ver todas
              </AuthLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
