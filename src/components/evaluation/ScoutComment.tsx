import { Textarea } from "@/components/ui/textarea";

interface ScoutCommentProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScoutComment({ value, onChange }: ScoutCommentProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-bold mb-2">Comentário do Olheiro</h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 200))}
        rows={2}
        placeholder="Observação rápida sobre o atleta..."
        className="resize-none text-sm"
        maxLength={200}
      />
      <p className="mt-1 text-right text-[10px] text-muted-foreground">
        {value.length}/200
      </p>
    </div>
  );
}
