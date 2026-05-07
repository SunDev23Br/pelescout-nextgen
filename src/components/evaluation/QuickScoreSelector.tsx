import { useState } from "react";
import { cn } from "@/lib/utils";

const SCORE_LABELS: Record<number, string> = {
  1: "Muito fraco",
  2: "Fraco",
  3: "Médio",
  4: "Bom",
  5: "Excelente",
};

interface QuickScoreSelectorProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
}

export function QuickScoreSelector({ label, icon, value, onChange }: QuickScoreSelectorProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg3/50 px-3 py-2.5 transition-all">
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-1 justify-center">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onMouseEnter={() => setHovered(score)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(score)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 active:scale-90",
              score <= displayValue
                ? "bg-primary text-primary-foreground shadow-gold scale-105"
                : "bg-border/50 text-muted-foreground hover:bg-border hover:text-foreground",
              score === value && "ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
            )}
          >
            {score}
          </button>
        ))}
      </div>
      <span className={cn(
        "text-[10px] font-semibold min-w-[70px] text-right transition-colors",
        displayValue >= 4 ? "text-success" : displayValue >= 3 ? "text-primary" : "text-destructive"
      )}>
        {displayValue > 0 ? SCORE_LABELS[displayValue] : "—"}
      </span>
    </div>
  );
}
