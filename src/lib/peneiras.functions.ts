import { supabase } from "@/integrations/supabase/client";

export interface CriarPeneiraInput {
  titulo: string;
  cidade: string;
  estado: string;
  local: string;
  data: string; // YYYY-MM-DD
  horaInicio: string;
  horaFim: string;
  duracaoJogoMin: number;
  participantesPorJogo: number;
  limiteInscricao: string; // "YYYY-MM-DDTHH:mm" local
  visibilidade: "publica" | "privada";
  descricao?: string;
}

export async function criarPeneira(input: CriarPeneiraInput): Promise<{ id: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Você precisa estar autenticado para criar uma peneira.");

  const limiteISO = new Date(input.limiteInscricao).toISOString();

  const insert = {
    titulo: input.titulo,
    cidade: input.cidade,
    estado: input.estado,
    local: input.local,
    data: input.data,
    hora_inicio: input.horaInicio,
    hora_fim: input.horaFim,
    duracao_jogo_min: input.duracaoJogoMin,
    participantes_por_jogo: input.participantesPorJogo,
    limite_inscricao: limiteISO,
    visibilidade: input.visibilidade,
    descricao: input.descricao || null,
    created_by: userId,
    invite_token:
      input.visibilidade === "privada"
        ? (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        : null,
  };

  const { data: row, error } = await supabase
    .from("peneiras")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    console.error("[criarPeneira] insert failed:", error);
    throw new Error(error.message);
  }
  return { id: row.id };
}
