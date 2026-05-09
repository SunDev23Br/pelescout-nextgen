import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const criarPeneiraSchema = z.object({
  titulo: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().min(2).max(2),
  local: z.string().min(1),
  data: z.string().min(1), // YYYY-MM-DD
  horaInicio: z.string().min(1),
  horaFim: z.string().min(1),
  duracaoJogoMin: z.number().int().positive(),
  participantesPorJogo: z.number().int().positive(),
  limiteInscricao: z.string().min(1), // ISO local "YYYY-MM-DDTHH:mm"
  visibilidade: z.enum(["publica", "privada"]),
  descricao: z.string().optional().default(""),
});

export const criarPeneira = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => criarPeneiraSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Convert local datetime "YYYY-MM-DDTHH:mm" to ISO timestamp
    const limiteISO = new Date(data.limiteInscricao).toISOString();

    const insert = {
      titulo: data.titulo,
      cidade: data.cidade,
      estado: data.estado,
      local: data.local,
      data: data.data,
      hora_inicio: data.horaInicio,
      hora_fim: data.horaFim,
      duracao_jogo_min: data.duracaoJogoMin,
      participantes_por_jogo: data.participantesPorJogo,
      limite_inscricao: limiteISO,
      visibilidade: data.visibilidade,
      descricao: data.descricao || null,
      created_by: userId,
      invite_token:
        data.visibilidade === "privada" ? crypto.randomUUID() : null,
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
  });
