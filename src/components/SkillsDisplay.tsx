import { BadgeCheck } from "lucide-react";
import { SKILL_KEYS, SKILL_LABELS, type SkillsMap } from "@/lib/skills";

interface Props {
  self: SkillsMap;
  validated?: SkillsMap | null;
  validatedAt?: string | null;
  validatorName?: string | null;
  animate?: boolean;
}

/**
 * Renders the athlete's 5 skills. When `validated` is present, its values
 * override the self values and a gold check badge is shown.
 */
export function SkillsDisplay({
  self,
  validated,
  validatedAt,
  validatorName,
  animate = true,
}: Props) {
  const hasValidated =
    !!validated && SKILL_KEYS.some((k) => validated[k] != null);
  const source = hasValidated ? (validated as SkillsMap) : self;
  const hasAny = SKILL_KEYS.some((k) => source[k] != null);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Habilidades
        </h2>
        {hasValidated && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"
            title={
              validatorName
                ? `Validado por ${validatorName}${validatedAt ? ` em ${new Date(validatedAt).toLocaleDateString("pt-BR")}` : ""}`
                : "Avaliação validada"
            }
          >
            <BadgeCheck className="h-3 w-3 fill-primary/20 text-primary" />
            Validado
          </span>
        )}
      </div>
      <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />

      {!hasAny ? (
        <p className="mt-4 text-sm italic text-muted-foreground">
          Nenhuma habilidade preenchida ainda.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {SKILL_KEYS.map((k) => {
            const value = source[k];
            if (value == null) return null;
            return (
              <li key={k}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {SKILL_LABELS[k]}
                  </span>
                  <span className="font-display text-xs font-bold text-primary">
                    {value}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-bg3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary transition-[width] duration-[1200ms] ease-out"
                    style={{ width: animate ? `${value}%` : "0%" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasValidated && self && SKILL_KEYS.some((k) => self[k] != null) && (
        <details className="mt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none hover:text-foreground">
            Ver autoavaliação do atleta
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-1 pl-2">
            {SKILL_KEYS.map((k) =>
              self[k] != null ? (
                <li key={k} className="text-[11px]">
                  {SKILL_LABELS[k]}:{" "}
                  <span className="font-semibold">{self[k]}</span>
                </li>
              ) : null,
            )}
          </ul>
        </details>
      )}
    </div>
  );
}
