import { useEffect, useState } from "react";
import { Accessibility, Contrast, Captions, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FontSize = "sm" | "md" | "lg" | "xl";

export interface A11yPrefs {
  fontSize: FontSize;
  highContrast: boolean;
  videoCaptions: boolean;
}

const DEFAULTS: A11yPrefs = {
  fontSize: "md",
  highContrast: false,
  videoCaptions: false,
};

const KEY = "png-a11y-prefs";

function load(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useA11yPrefs() {
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULTS);
  useEffect(() => setPrefs(load()), []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* noop */
    }
  }, [prefs]);
  return [prefs, setPrefs] as const;
}

export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function a11yContainerClass(prefs: A11yPrefs): string {
  const cls = [FONT_SIZE_CLASS[prefs.fontSize]];
  if (prefs.highContrast) cls.push("a11y-high-contrast");
  return cls.join(" ");
}

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "A-" },
  { value: "md", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];

export function AccessibilityControls({
  prefs,
  onChange,
}: {
  prefs: A11yPrefs;
  onChange: (p: A11yPrefs) => void;
}) {
  return (
    <div
      role="region"
      aria-label="Opções de acessibilidade"
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-3 shadow-card sm:gap-3"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Accessibility className="h-4 w-4" aria-hidden /> Acessibilidade
      </div>

      <div
        role="group"
        aria-label="Tamanho da fonte"
        className="flex items-center gap-1 rounded-full border border-border bg-background p-1"
      >
        <Type className="ml-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        {FONT_SIZES.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={prefs.fontSize === f.value}
            aria-label={`Tamanho da fonte ${f.label}`}
            onClick={() => onChange({ ...prefs, fontSize: f.value })}
            className={
              "min-h-9 min-w-9 rounded-full px-2 text-xs font-bold transition-colors " +
              (prefs.fontSize === f.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <Button
        type="button"
        size="sm"
        variant={prefs.highContrast ? "default" : "outline"}
        aria-pressed={prefs.highContrast}
        onClick={() => onChange({ ...prefs, highContrast: !prefs.highContrast })}
        className="min-h-9"
      >
        <Contrast className="mr-1.5 h-4 w-4" aria-hidden />
        Alto contraste
      </Button>

      <Button
        type="button"
        size="sm"
        variant={prefs.videoCaptions ? "default" : "outline"}
        aria-pressed={prefs.videoCaptions}
        onClick={() => onChange({ ...prefs, videoCaptions: !prefs.videoCaptions })}
        className="min-h-9"
      >
        <Captions className="mr-1.5 h-4 w-4" aria-hidden />
        Descrições nos vídeos
      </Button>
    </div>
  );
}
