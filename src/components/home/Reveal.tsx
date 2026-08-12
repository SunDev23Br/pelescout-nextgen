import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

/**
 * Revela conteúdo ao entrar em viewport.
 * Com `immediate`, revela logo na montagem (animação de abertura da página).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
  immediate?: boolean;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!immediate) return;
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, [immediate]);

  const visible = immediate ? mounted : shown;

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-6 opacity-0 blur-[2px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-primary",
        className,
      )}
    >
      <span className="h-px w-8 bg-primary/60" />
      {children}
    </p>
  );
}

/** Botão dourado com brilho corrido no hover (desenho clássico da marca). */
export function GoldButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
      {children}
    </span>
  );
}
