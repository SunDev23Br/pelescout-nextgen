import { useMemo } from "react";
import type { Peneira } from "@/lib/mock-data";
import { UF_COORDS } from "@/lib/geo";
import { Eyebrow, Reveal } from "./Reveal";

const LAT = { min: -34, max: 6 };
const LNG = { min: -74, max: -34 };

function project(lat: number, lng: number) {
  const x = ((lng - LNG.min) / (LNG.max - LNG.min)) * 100;
  const y = ((LAT.max - lat) / (LAT.max - LAT.min)) * 100;
  return { x, y };
}

export function MapaOportunidades({ peneiras }: { peneiras: Peneira[] }) {
  const porUf = useMemo(() => {
    const m = new Map<string, number>();
    peneiras
      .filter((p) => p.status !== "encerrada")
      .forEach((p) => m.set(p.estado, (m.get(p.estado) ?? 0) + 1));
    return m;
  }, [peneiras]);

  const top = useMemo(
    () => [...porUf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    [porUf],
  );

  return (
    <section className="border-y border-border bg-bg2/40">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-24 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:px-10 lg:py-32">
        <Reveal>
          <Eyebrow>Mapa de oportunidades</Eyebrow>
          <h2 className="mt-6 max-w-md font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-5xl">
            O talento está espalhado. A avaliação também.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Cada ponto representa um estado com peneiras ativas na plataforma.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
            {top.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Novas regiões em breve.
              </p>
            ) : (
              top.map(([uf, n]) => (
                <div key={uf} className="border-t border-border pt-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    {uf}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums text-primary">
                    {String(n).padStart(2, "0")}
                  </dd>
                </div>
              ))
            )}
          </dl>
        </Reveal>

        <Reveal delay={140}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-lg">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full"
              role="img"
              aria-label="Distribuição de peneiras pelos estados do Brasil"
            >
              {Object.entries(UF_COORDS).map(([uf, c]) => {
                const { x, y } = project(c.lat, c.lng);
                const n = porUf.get(uf) ?? 0;
                const ativo = n > 0;
                return (
                  <g key={uf}>
                    {ativo && (
                      <circle
                        cx={x}
                        cy={y}
                        r={2.6 + Math.min(n, 5) * 0.5}
                        className="fill-primary/15"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={ativo ? 1.15 : 0.5}
                      className={
                        ativo ? "fill-primary" : "fill-foreground/25"
                      }
                    />
                    {ativo && (
                      <text
                        x={x + 2.6}
                        y={y + 1}
                        className="fill-foreground/70 text-[2.6px] font-bold tracking-[0.1em]"
                      >
                        {uf}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
