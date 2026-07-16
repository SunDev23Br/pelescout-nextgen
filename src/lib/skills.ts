// Shared skill helpers — Fase 1 do perfil do atleta
export const SKILL_KEYS = [
  "marcacao",
  "forca",
  "passe",
  "velocidade",
  "posicionamento",
] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

export const SKILL_LABELS: Record<SkillKey, string> = {
  marcacao: "Marcação",
  forca: "Força",
  passe: "Passe",
  velocidade: "Velocidade",
  posicionamento: "Posicionamento",
};

export type SkillsMap = Partial<Record<SkillKey, number | null>>;

export function parseSkills(raw: unknown): SkillsMap {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as Record<string, unknown>;
  const out: SkillsMap = {};
  for (const k of SKILL_KEYS) {
    const v = src[k];
    if (v == null || v === "") continue;
    const n = Number(v);
    if (!Number.isFinite(n)) continue;
    out[k] = clampSkill(n);
  }
  return out;
}

export function clampSkill(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function cleanSkillsForSave(m: SkillsMap): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of SKILL_KEYS) {
    const v = m[k];
    if (v == null) continue;
    out[k] = clampSkill(Number(v));
  }
  return out;
}

/** "2020-2022" | "2020 - 2022" | "2020–2022" → "2020 – 2022" */
export function formatClubPeriod(input: string): string {
  const s = (input ?? "").trim();
  if (!s) return "";
  // Match two 4-digit years separated by any dash-like char.
  const m = s.match(/^(\d{4})\s*[-–—]\s*(\d{4})$/);
  if (m) return `${m[1]} – ${m[2]}`;
  // Also accept "2020 - atual" / "2020 – hoje"
  const m2 = s.match(/^(\d{4})\s*[-–—]\s*(atual|hoje|presente|now)$/i);
  if (m2) return `${m2[1]} – Atual`;
  // Single year
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

const LOWERCASE_WORDS = new Set([
  "de",
  "do",
  "da",
  "dos",
  "das",
  "e",
  "y",
  "of",
  "the",
]);

export function titleCaseClub(input: string): string {
  const s = (input ?? "").trim().replace(/\s+/g, " ");
  if (!s) return "";
  return s
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      // Keep short function words lowercase except when they're the first word
      if (i > 0 && LOWERCASE_WORDS.has(lower)) return lower;
      // Preserve initial acronyms like "SC" / "FC" / "EC"
      if (/^[A-Z]{2,4}$/.test(word)) return word;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
