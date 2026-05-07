import { cn } from "@/lib/utils";

const POSITIVE_TAGS = [
  "Bom passe", "Inteligente", "Forte fisicamente", "Rápido", "Boa visão",
  "Competitivo", "Boa movimentação", "Bom posicionamento", "Liderança", "Técnico",
];

const NEGATIVE_TAGS = [
  "Lento", "Sem intensidade", "Afobado", "Individualista", "Desatento",
  "Fraco fisicamente", "Erra decisões", "Mal posicionado", "Inseguro", "Pouco participativo",
];

interface TagSelectorProps {
  selectedPositive: string[];
  selectedNegative: string[];
  onTogglePositive: (tag: string) => void;
  onToggleNegative: (tag: string) => void;
}

export function TagSelector({
  selectedPositive,
  selectedNegative,
  onTogglePositive,
  onToggleNegative,
}: TagSelectorProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-4">
      <h3 className="font-display text-sm font-bold">Tags Rápidas</h3>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-success mb-2">
          ✦ Pontos fortes
        </p>
        <div className="flex flex-wrap gap-1.5">
          {POSITIVE_TAGS.map((tag) => {
            const selected = selectedPositive.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTogglePositive(tag)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 active:scale-95",
                  selected
                    ? "bg-success/20 text-success border border-success/40 shadow-sm"
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
        <p className="text-[10px] font-bold uppercase tracking-wider text-destructive mb-2">
          ✦ Pontos fracos
        </p>
        <div className="flex flex-wrap gap-1.5">
          {NEGATIVE_TAGS.map((tag) => {
            const selected = selectedNegative.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleNegative(tag)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 active:scale-95",
                  selected
                    ? "bg-destructive/20 text-destructive border border-destructive/40 shadow-sm"
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
  );
}
