import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface OverallRatingProps {
  scores: {
    tecnica: number;
    tatica: number;
    fisica: number;
    mental: number;
    intensidade: number;
  };
}

type Classification = {
  label: string;
  color: string;
  bg: string;
};

const CLASSIFICATIONS: { min: number; data: Classification }[] = [
  { min: 4.5, data: { label: "Elite", color: "text-primary", bg: "bg-primary/15 border-primary/30" } },
  { min: 3.5, data: { label: "Promissor", color: "text-success", bg: "bg-success/15 border-success/30" } },
  { min: 2.5, data: { label: "Em desenvolvimento", color: "text-blue-light", bg: "bg-blue-light/15 border-blue-light/30" } },
  { min: 0, data: { label: "Abaixo do nível", color: "text-destructive", bg: "bg-destructive/15 border-destructive/30" } },
];

export function OverallRating({ scores }: OverallRatingProps) {
  const avg = (scores.tecnica + scores.tatica + scores.fisica + scores.mental + scores.intensidade) / 5;
  const classification = useMemo(() => {
    return CLASSIFICATIONS.find((c) => avg >= c.min)?.data ?? CLASSIFICATIONS[3].data;
  }, [avg]);

  return (
    <div className={cn("rounded-2xl border p-4 text-center shadow-card transition-all", classification.bg)}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nota Geral</p>
      <p className="font-display text-4xl font-extrabold text-gradient-gold mt-1">
        {avg > 0 ? avg.toFixed(1) : "—"}
      </p>
      <p className={cn("text-xs font-bold uppercase tracking-wider mt-1", classification.color)}>
        {avg > 0 ? classification.label : "Aguardando avaliação"}
      </p>
    </div>
  );
}
