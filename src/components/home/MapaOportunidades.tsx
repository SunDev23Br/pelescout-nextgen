import { useMemo, useState } from "react";
import type { Peneira } from "@/lib/mock-data";
import { UF_COORDS } from "@/lib/geo";
import { Eyebrow, Reveal } from "./Reveal";

const LAT = { min: -34, max: 6 };
const LNG = { min: -74, max: -34 };

/** Deslocamento manual do rótulo em estados que se sobrepõem. */
const LABEL_OFFSET: Record<string, { dx: number; dy: number }> = {
  DF: { dx: -6.5, dy: -1.6 },
  GO: { dx: 2.8, dy: 2.4 },
  SE: { dx: 2.8, dy: 1.6 },
  AL: { dx: 2.8, dy: -1.2 },
  PB: { dx: 2.8, dy: -1.4 },
  PE: { dx: -6.5, dy: 0 },
  RN: { dx: 2.8, dy: -1.8 },
  RJ: { dx: 2.8, dy: 2.2 },
  ES: { dx: 2.8, dy: -0.6 },
  SP: { dx: -6.5, dy: 0.8 },
  SC: { dx: 2.8, dy: 1.4 },
  RS: { dx: -6.5, dy: 1.4 },
};

function project(lat: number, lng: number) {
  const x = ((lng - LNG.min) / (LNG.max - LNG.min)) * 100;
  const y = ((LAT.max - lat) / (LAT.max - LAT.min)) * 100;
  return { x, y };
}

export function MapaOportunidades({ peneiras }: { peneiras: Peneira[] }) {
  const [ativoUf, setAtivoUf] = useState<string | null>(null);

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

  const totalAtivas = useMemo(
    () => [...porUf.values()].reduce((s, n) => s + n, 0),
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
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Cada ponto representa um estado com peneiras ativas na plataforma —
            {" "}
            <span className="font-semibold text-foreground tabular-nums">
              {totalAtivas}
            </span>{" "}
            no total. Passe o cursor sobre um estado da lista para localizá-lo
            no mapa.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
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
          <div className="relative mx-auto aspect-square w-full max-w-xl">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full overflow-visible"
              role="img"
              aria-label="Distribuição de peneiras pelos estados do Brasil"
            >
              {Object.entries(UF_COORDS).map(([uf, c]) => {
                const { x, y } = project(c.lat, c.lng);
                const n = porUf.get(uf) ?? 0;
                const ativo = n > 0;
                const destaque = ativoUf === uf;
                const off = LABEL_OFFSET[uf] ?? { dx: 2.6, dy: 1 };
                return (
                  <g
                    key={uf}
                    onMouseEnter={() => ativo && setAtivoUf(uf)}
                    onMouseLeave={() => setAtivoUf(null)}
                    className={ativo ? "cursor-pointer" : undefined}
                  >
                    {ativo && (
                      <circle
                        cx={x}
                        cy={y}
                        r={2.4 + Math.min(n, 5) * 0.45}
                        className={
                          destaque
                            ? "fill-primary/35"
                            : "animate-pulse fill-primary/15"
                        }
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={ativo ? (destaque ? 1.8 : 1.15) : 0.45}
                      className={
                        ativo ? "fill-primary" : "fill-foreground/20"
                      }
                    />
                    {ativo && (
                      <text
                        x={x + off.dx}
                        y={y + off.dy}
                        className={`hidden text-[2.4px] font-bold tracking-[0.08em] sm:block ${
                          destaque ? "fill-primary" : "fill-foreground/65"
                        }`}
                      >
                        {uf}
                      </text>
                    )}
                    {destaque && (
                      <>
                        <rect
                          x={x - 9}
                          y={y - 9.5}
                          width={18}
                          height={6}
                          rx={3}
                          className="fill-foreground"
                        />
                        <text
                          x={x}
                          y={y - 5.4}
                          textAnchor="middle"
                          className="fill-background text-[2.8px] font-bold"
                        >
                          {uf} · {n} peneira{n > 1 ? "s" : ""}
                        </text>
                      </>
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
