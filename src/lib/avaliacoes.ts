import { supabase } from "@/integrations/supabase/client";

export type Decisao = "aprovado" | "reprovado" | "reavaliar";

export interface SalvarAvaliacaoInput {
  candidatoId?: string | null;
  atletaUserId?: string | null;
  peneiraId?: string | null;
  scores: {
    tecnica: number;
    tatica: number;
    fisica: number;
    mental: number;
    intensidade: number;
  };
  peBonus: number;
  tagsPositivas: string[];
  tagsNegativas: string[];
  comentario: string;
  decisao?: Decisao | null;
}

export interface SalvarAvaliacaoResult {
  id: string;
  notaGeral: number;
}

export function calcularNotaGeral(
  scores: SalvarAvaliacaoInput["scores"],
  peBonus: number,
): number {
  const media =
    (scores.tecnica + scores.tatica + scores.fisica + scores.mental + scores.intensidade) /
    5;
  return Math.min(10, Math.max(0, Number((media + peBonus).toFixed(2))));
}

const STATUS_BY_DECISAO: Record<Decisao, "aprovado" | "reprovado" | "avaliado"> = {
  aprovado: "aprovado",
  reprovado: "reprovado",
  reavaliar: "avaliado",
};

export async function salvarAvaliacao(
  input: SalvarAvaliacaoInput,
): Promise<SalvarAvaliacaoResult> {
  const { data: auth } = await supabase.auth.getUser();
  const avaliadorId = auth.user?.id;
  if (!avaliadorId) throw new Error("Você precisa estar autenticado para salvar avaliações.");

  if (!input.candidatoId && !input.atletaUserId) {
    throw new Error("Informe candidato ou atleta para salvar a avaliação.");
  }

  const notaGeral = calcularNotaGeral(input.scores, input.peBonus);

  const { data, error } = await supabase
    .from("avaliacoes")
    .insert({
      avaliador_id: avaliadorId,
      candidato_id: input.candidatoId ?? null,
      atleta_user_id: input.atletaUserId ?? null,
      peneira_id: input.peneiraId ?? null,
      tecnica: input.scores.tecnica,
      tatico: input.scores.tatica,
      fisico: input.scores.fisica,
      mental: input.scores.mental,
      intensidade: input.scores.intensidade,
      psicologico: input.scores.mental,
      pe_bonus: input.peBonus,
      tags_positivas: input.tagsPositivas,
      tags_negativas: input.tagsNegativas,
      comentario: input.comentario || null,
      decisao: input.decisao ?? null,
      nota_geral: notaGeral,
    })
    .select("id")
    .single();

  if (error) throw error;

  // If candidate, reflect score and status on candidato row
  if (input.candidatoId) {
    const status = input.decisao ? STATUS_BY_DECISAO[input.decisao] : undefined;
    await supabase
      .from("candidatos")
      .update(
        status
          ? { nota_geral: notaGeral, status }
          : { nota_geral: notaGeral },
      )
      .eq("id", input.candidatoId);
  }

  // Fire email (best-effort, non-blocking failure)
  try {
    await supabase.functions.invoke("send-avaliacao-email", {
      body: { avaliacaoId: data.id },
    });
  } catch (err) {
    console.warn("[avaliacoes] email send skipped:", err);
  }

  return { id: data.id, notaGeral };
}

export async function getUltimaAvaliacaoAtleta(
  atletaUserId: string,
): Promise<{ notaGeral: number | null; createdAt: string } | null> {
  // Try direct atleta avaliacoes
  const { data: direct } = await supabase
    .from("avaliacoes")
    .select("nota_geral, created_at")
    .eq("atleta_user_id", atletaUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (direct?.nota_geral != null) {
    return { notaGeral: Number(direct.nota_geral), createdAt: direct.created_at };
  }

  // Fallback: avaliações via candidato vinculado ao atleta
  const { data: cands } = await supabase
    .from("candidatos")
    .select("id")
    .eq("user_id", atletaUserId);
  const ids = (cands ?? []).map((c) => c.id);
  if (ids.length === 0) return direct ? { notaGeral: null, createdAt: direct.created_at } : null;

  const { data: viaCand } = await supabase
    .from("avaliacoes")
    .select("nota_geral, created_at")
    .in("candidato_id", ids)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!viaCand) return null;
  return {
    notaGeral: viaCand.nota_geral != null ? Number(viaCand.nota_geral) : null,
    createdAt: viaCand.created_at,
  };
}
