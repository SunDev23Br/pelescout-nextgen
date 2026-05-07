import { cn } from "@/lib/utils";
import type { StatusPeneira } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";

const styles: Record<StatusPeneira, string> = {
  aberta:
    "bg-success text-background border-2 border-success ring-2 ring-success/40 font-bold uppercase tracking-wide shadow-lg",
  em_andamento:
    "bg-blue-light text-background border-2 border-blue-light ring-2 ring-blue-light/40 font-bold uppercase tracking-wide shadow-lg",
  encerrada:
    "bg-muted-foreground text-background border-2 border-muted-foreground ring-2 ring-muted-foreground/40 font-bold uppercase tracking-wide shadow-lg",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusPeneira;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow",
        styles[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "aberta" && "bg-background animate-pulse",
          status === "em_andamento" && "bg-blue-light animate-pulse",
          status === "encerrada" && "bg-muted-foreground",
        )}
      />
      {statusLabel[status]}
    </span>
  );
}
