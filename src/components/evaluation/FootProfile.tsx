import { Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

export type DominantFoot = "direita" | "esquerda" | "ambidestro";

export interface BilateralConfidence {
  passe: number;
  finalizacao: number;
  dominio: number;
  drible: number;
}

export interface FootData {
  dominante: DominantFoot | null;
  usoNaoDominante: number; // 0-5
  bilateral: BilateralConfidence;
  positiveTags: string[];
  negativeTags: string[];
}

export const EMPTY_FOOT_DATA: FootData = {
  dominante: null,
  usoNaoDominante: 0,
  bilateral: { passe: 0, finalizacao: 0, dominio: 0, drible: 0 },
  positiveTags: [],
  negativeTags: [],
};

export const FOOT_POSITIVE_TAGS = [
  "Boa perna fraca",
  "Ambidestro",
  "Finaliza com ambas",
  "Bom passe bilateral",
];

export const FOOT_NEGATIVE_TAGS = [
  "Dependente da dominante",
  "Evita perna fraca",
  "Limitação técnica bilateral",
];

const USO_LABELS = ["—", "Não usa", "Muito fraca", "Razoável", "Boa", "Excelente"];

interface FootProfileProps {
  data: FootData;
  onChange: (data: FootData) => void;
}

export function FootProfile({ data, onChange }: FootProfileProps) {
  const setDominante = (d: DominantFoot) => onChange({ ...data, dominante: d });
  const setUso = (n: number) => onChange({ ...data, usoNaoDominante: n });
  const setBilateral = (key: keyof BilateralConfidence, v: number) =>
    onChange({ ...data, bilateral: { ...data.bilateral, [key]: v } });
  const togglePos = (t: string) =>
    onChange({
      ...data,
      positiveTags: data.positiveTags.includes(t)
        ? data.positiveTags.filter((x) => x !== t)
        : [...data.positiveTags, t],
    });
  const toggleNeg = (t: string) =>
    onChange({
      ...data,
      negativeTags: data.negativeTags.includes(t)
        ? data.negativeTags.filter((x) => x !== t)
        : [...data.negativeTags, t],
    });

  const footOptions: { value: DominantFoot; label: string; icon: React.ReactNode }[] = [
    { value: "esquerda", label: "Esquerda", icon: <Footprints className="h-5 w-5 -scale-x-100" /> },
    { value: "ambidestro", label: "Ambidestro", icon: (
      <div className="flex">
        <Footprints className="h-5 w-5 -scale-x-100" />
        <Footprints className="h-5 w-5 -ml-1" />
      </div>
    )},
    { value: "direita", label: "Direita", icon: <Footprints className="h-5 w-5" /> },
  ];

  const bilateralFields: { key: keyof BilateralConfidence; label: string }[] = [
    { key: "passe", label: "Passe" },
    { key: "finalizacao", label: "Finalização" },
    { key: "dominio", label: "Domínio" },
    { key: "drible", label: "Drible" },
  ];

  const valores = [
    data.usoNaoDominante,
    data.bilateral.passe,
    data.bilateral.finalizacao,
    data.bilateral.dominio,
    data.bilateral.drible,
  ].filter((v) => v > 0);
  const mediaPerna = valores.length
    ? valores.reduce((a, b) => a + b, 0) / valores.length
    : 0;

  const mediaColor = mediaPerna >= 4
    ? "text-success border-success/30 bg-success/10"
    : mediaPerna >= 3
      ? "text-primary border-primary/30 bg-primary/10"
      : mediaPerna > 0
        ? "text-destructive border-destructive/30 bg-destructive/10"
        : "text-muted-foreground border-border bg-bg2";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Footprints className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold">Perna Dominante & Bilateralidade</h3>
        </div>
        <div className={cn("flex items-baseline gap-1.5 rounded-full border px-3 py-1", mediaColor)}>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Média</span>
          <span className="font-display text-sm font-extrabold tabular-nums">
            {mediaPerna > 0 ? mediaPerna.toFixed(1) : "—"}
          </span>
        </div>
      </div>

      {/* Dominant foot */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Perna dominante
        </p>
        <div className="grid grid-cols-3 gap-2">
          {footOptions.map((opt) => {
            const active = data.dominante === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDominante(opt.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-all duration-150 active:scale-95",
                  active
                    ? "border-primary bg-primary/15 text-primary shadow-md"
                    : "border-border bg-bg2 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {opt.icon}
                <span className="text-[11px] font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Uso da perna não dominante */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Uso da perna não dominante
          </p>
          <span className="text-[10px] text-primary font-semibold">
            {USO_LABELS[data.usoNaoDominante]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = data.usoNaoDominante === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setUso(n)}
                className={cn(
                  "flex-1 h-9 rounded-lg border text-xs font-bold transition-all duration-150 active:scale-95",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-bg2 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confiança bilateral */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Confiança bilateral
        </p>
        <div className="space-y-1.5">
          {bilateralFields.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="w-20 text-[11px] font-medium text-foreground/80">{f.label}</span>
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = data.bilateral[f.key] === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setBilateral(f.key, n)}
                      className={cn(
                        "flex-1 h-7 rounded-md border text-[10px] font-bold transition-all duration-150 active:scale-95",
                        active
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border/60 bg-bg2 text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2 pt-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-success mb-1.5">
            ✦ Positivas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FOOT_POSITIVE_TAGS.map((tag) => {
              const selected = data.positiveTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => togglePos(tag)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 active:scale-95",
                    selected
                      ? "bg-success/20 text-success border border-success/40"
                      : "bg-border/30 text-muted-foreground border border-transparent hover:bg-border/60 hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-destructive mb-1.5">
            ✦ Negativas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FOOT_NEGATIVE_TAGS.map((tag) => {
              const selected = data.negativeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleNeg(tag)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 active:scale-95",
                    selected
                      ? "bg-destructive/20 text-destructive border border-destructive/40"
                      : "bg-border/30 text-muted-foreground border border-transparent hover:bg-border/60 hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compute the technique bonus from foot/bilateral data.
 * Returns a number between -0.3 and +0.5 to add to base technical score.
 */
export function computeFootBonus(data: FootData): number {
  if (!data.dominante) return 0;
  let bonus = 0;
  if (data.dominante === "ambidestro") bonus += 0.3;
  if (data.usoNaoDominante >= 4) bonus += 0.2;
  else if (data.usoNaoDominante === 3) bonus += 0.1;
  else if (data.usoNaoDominante > 0 && data.usoNaoDominante <= 2) bonus -= 0.2;

  const bilateralAvg =
    (data.bilateral.passe + data.bilateral.finalizacao + data.bilateral.dominio + data.bilateral.drible) / 4;
  if (bilateralAvg >= 4) bonus += 0.2;
  else if (bilateralAvg > 0 && bilateralAvg < 2) bonus -= 0.1;

  if (data.negativeTags.includes("Dependente da dominante")) bonus -= 0.1;
  if (data.positiveTags.includes("Ambidestro") || data.positiveTags.includes("Boa perna fraca")) bonus += 0.1;

  return Math.max(-0.3, Math.min(0.5, bonus));
}
