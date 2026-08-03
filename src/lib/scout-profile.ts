import { supabase } from "@/integrations/supabase/client";

export interface ScoutExperiencia {
  periodo: string;
  cargo: string;
}

export interface ScoutExtra {
  cargo: string | null;
  especialidades: string[];
  posicoes: string[];
  competicoes: string[];
  experiencia: ScoutExperiencia[];
  instagram: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  email_contato: string | null;
  disponivel: boolean;
}

export const ESPECIALIDADES_OPCOES = [
  "Sub-11",
  "Sub-13",
  "Sub-15",
  "Sub-17",
  "Sub-20",
  "Profissional",
  "Feminino",
];

export const POSICOES_OPCOES: { emoji: string; label: string }[] = [
  { emoji: "🥅", label: "Goleiros" },
  { emoji: "🛡️", label: "Zagueiros" },
  { emoji: "🏃", label: "Laterais" },
  { emoji: "⚙️", label: "Volantes" },
  { emoji: "🎯", label: "Meias" },
  { emoji: "⚽", label: "Atacantes" },
];

export function posicaoEmoji(label: string) {
  return POSICOES_OPCOES.find((p) => p.label === label)?.emoji ?? "⚽";
}

export const SCOUT_EXTRA_VAZIO: ScoutExtra = {
  cargo: null,
  especialidades: [],
  posicoes: [],
  competicoes: [],
  experiencia: [],
  instagram: null,
  linkedin: null,
  whatsapp: null,
  email_contato: null,
  disponivel: true,
};

function parseExperiencia(raw: unknown): ScoutExperiencia[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const periodo = typeof obj["periodo"] === "string" ? obj["periodo"] : "";
      const cargo = typeof obj["cargo"] === "string" ? obj["cargo"] : "";
      if (!periodo && !cargo) return null;
      return { periodo, cargo };
    })
    .filter((x): x is ScoutExperiencia => x !== null);
}

export async function loadScoutExtra(userId: string): Promise<ScoutExtra> {
  const { data } = await supabase
    .from("scout_profiles")
    .select(
      "cargo, especialidades, posicoes, competicoes, experiencia, instagram, linkedin, whatsapp, email_contato, disponivel",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return { ...SCOUT_EXTRA_VAZIO };

  return {
    cargo: data.cargo ?? null,
    especialidades: data.especialidades ?? [],
    posicoes: data.posicoes ?? [],
    competicoes: data.competicoes ?? [],
    experiencia: parseExperiencia(data.experiencia),
    instagram: data.instagram ?? null,
    linkedin: data.linkedin ?? null,
    whatsapp: data.whatsapp ?? null,
    email_contato: data.email_contato ?? null,
    disponivel: data.disponivel ?? true,
  };
}

export async function saveScoutExtra(userId: string, extra: ScoutExtra) {
  const { error } = await supabase.from("scout_profiles").upsert(
    {
      user_id: userId,
      cargo: extra.cargo,
      especialidades: extra.especialidades,
      posicoes: extra.posicoes,
      competicoes: extra.competicoes,
      experiencia: extra.experiencia.map((x) => ({ ...x })) as unknown as Record<
        string,
        string
      >[],
      instagram: extra.instagram,
      linkedin: extra.linkedin,
      whatsapp: extra.whatsapp,
      email_contato: extra.email_contato,
      disponivel: extra.disponivel,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}

export async function setScoutDisponibilidade(
  userId: string,
  disponivel: boolean,
) {
  const { error } = await supabase
    .from("scout_profiles")
    .upsert({ user_id: userId, disponivel }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

/** Normaliza um @handle ou URL para uma URL completa da rede social. */
export function socialUrl(base: string, value: string | null | undefined) {
  const v = (value ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `${base}/${v.replace(/^@/, "")}`;
}
