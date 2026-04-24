import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
        <span className="font-display text-xl font-extrabold text-primary-foreground">
          P
        </span>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-white ring-2 ring-background">
          10
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-base font-extrabold tracking-tight">
          Pelé <span className="text-gradient-gold">Next Gen</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Academia
        </span>
      </div>
    </div>
  );
}
