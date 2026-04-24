import { cn } from "@/lib/utils";
import type { StatusPeneira } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";

const styles: Record<StatusPeneira, string> = {
  aberta:
    "bg-success/15 text-success border border-success/30",
  em_andamento:
    "bg-blue-light/15 text-blue-light border border-blue-light/30",
  encerrada:
    "bg-muted-foreground/15 text-muted-foreground border border-muted-foreground/20",
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "aberta" && "bg-success animate-pulse",
          status === "em_andamento" && "bg-blue-light animate-pulse",
          status === "encerrada" && "bg-muted-foreground",
        )}
      />
      {statusLabel[status]}
    </span>
  );
}
