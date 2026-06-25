import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AvaliacaoItem {
  id: string;
  tecnica: number | null;
  fisico: number | null;
  tatico: number | null;
  mental: number | null;
  intensidade: number | null;
  pe_bonus: number | null;
  nota_geral: number | null;
  decisao: string | null;
  tags_positivas: string[] | null;
  tags_negativas: string[] | null;
  comentario: string | null;
  created_at: string;
  avaliador_nome: string | null;
}

export interface PeneiraDesempenho {
  candidato_id: string | null;
  peneira: {
    id: string;
    titulo: string;
    data: string | null;
    local: string | null;
    clube_nome: string | null;
  } | null;
  status: string | null;
  nota_geral_candidato: number | null;
  avaliacoes: AvaliacaoItem[];
}

export const getMeuDesempenho = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PeneiraDesempenho[]> => {
    const { supabase, userId } = context;

    // 1) Candidaturas do atleta
    const { data: candidatos, error: candErr } = await supabase
      .from("candidatos")
      .select(
        "id, status, nota_geral, peneira:peneiras(id, titulo, data, local, created_by)",
      )
      .eq("user_id", userId);
    if (candErr) throw new Error(candErr.message);

    const candidatoIds = (candidatos ?? []).map((c) => c.id);
    const clubeIds = Array.from(
      new Set(
        (candidatos ?? [])
          .map((c) => (c.peneira as any)?.created_by)
          .filter((v): v is string => !!v),
      ),
    );

    // 2) Avaliações: por candidato_id OR por atleta_user_id
    const orFilter: string[] = [`atleta_user_id.eq.${userId}`];
    if (candidatoIds.length > 0) {
      orFilter.push(`candidato_id.in.(${candidatoIds.join(",")})`);
    }
    const { data: avals, error: avalErr } = await supabase
      .from("avaliacoes")
      .select(
        "id, candidato_id, atleta_user_id, peneira_id, tecnica, fisico, tatico, mental, intensidade, pe_bonus, nota_geral, decisao, tags_positivas, tags_negativas, comentario, created_at, avaliador_id",
      )
      .or(orFilter.join(","));
    if (avalErr) throw new Error(avalErr.message);

    // 3) Resolver nomes (clubes + avaliadores) numa única consulta a profiles
    const avaliadorIds = Array.from(
      new Set((avals ?? []).map((a) => a.avaliador_id).filter(Boolean)),
    ) as string[];
    const allProfileIds = Array.from(new Set([...clubeIds, ...avaliadorIds]));

    const profileMap = new Map<string, string>();
    if (allProfileIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nome, nome_clube")
        .in("id", allProfileIds);
      (profs ?? []).forEach((p: any) => {
        profileMap.set(p.id, p.nome_clube || p.nome || "");
      });
    }

    // 4) Peneiras avulsas (avaliações sem candidato vinculado a este atleta)
    const extraPeneiraIds = Array.from(
      new Set(
        (avals ?? [])
          .filter(
            (a) =>
              a.peneira_id &&
              !(candidatos ?? []).some(
                (c) => (c.peneira as any)?.id === a.peneira_id,
              ),
          )
          .map((a) => a.peneira_id as string),
      ),
    );
    const peneiraExtraMap = new Map<string, any>();
    if (extraPeneiraIds.length > 0) {
      const { data: pen } = await supabase
        .from("peneiras")
        .select("id, titulo, data, local, created_by")
        .in("id", extraPeneiraIds);
      (pen ?? []).forEach((p) => peneiraExtraMap.set(p.id, p));
    }

    // 5) Agrupar
    const groups: PeneiraDesempenho[] = [];

    (candidatos ?? []).forEach((c) => {
      const pen = c.peneira as any;
      const myAvals = (avals ?? []).filter((a) => a.candidato_id === c.id);
      groups.push({
        candidato_id: c.id,
        peneira: pen
          ? {
              id: pen.id,
              titulo: pen.titulo,
              data: pen.data,
              local: pen.local,
              clube_nome: pen.created_by ? profileMap.get(pen.created_by) ?? null : null,
            }
          : null,
        status: c.status,
        nota_geral_candidato: c.nota_geral,
        avaliacoes: myAvals.map((a) => ({
          id: a.id,
          tecnica: a.tecnica,
          fisico: a.fisico,
          tatico: a.tatico,
          mental: a.mental,
          intensidade: a.intensidade,
          pe_bonus: a.pe_bonus,
          nota_geral: a.nota_geral,
          decisao: a.decisao,
          tags_positivas: a.tags_positivas,
          tags_negativas: a.tags_negativas,
          comentario: a.comentario,
          created_at: a.created_at,
          avaliador_nome: a.avaliador_id
            ? profileMap.get(a.avaliador_id) ?? null
            : null,
        })),
      });
    });

    // Avaliações sem candidato (agrupar por peneira_id)
    const orphanByPeneira = new Map<string, typeof avals>();
    (avals ?? []).forEach((a) => {
      if (a.candidato_id) return;
      const key = a.peneira_id ?? "__sem_peneira__";
      const arr = orphanByPeneira.get(key) ?? [];
      arr.push(a);
      orphanByPeneira.set(key, arr);
    });
    orphanByPeneira.forEach((arr, peneiraId) => {
      const pen = peneiraId !== "__sem_peneira__" ? peneiraExtraMap.get(peneiraId) : null;
      groups.push({
        candidato_id: null,
        peneira: pen
          ? {
              id: pen.id,
              titulo: pen.titulo,
              data: pen.data,
              local: pen.local,
              clube_nome: pen.created_by ? profileMap.get(pen.created_by) ?? null : null,
            }
          : null,
        status: null,
        nota_geral_candidato: null,
        avaliacoes: arr.map((a) => ({
          id: a.id,
          tecnica: a.tecnica,
          fisico: a.fisico,
          tatico: a.tatico,
          mental: a.mental,
          intensidade: a.intensidade,
          pe_bonus: a.pe_bonus,
          nota_geral: a.nota_geral,
          decisao: a.decisao,
          tags_positivas: a.tags_positivas,
          tags_negativas: a.tags_negativas,
          comentario: a.comentario,
          created_at: a.created_at,
          avaliador_nome: a.avaliador_id
            ? profileMap.get(a.avaliador_id) ?? null
            : null,
        })),
      });
    });

    // Ordenar por data da peneira desc (sem data vai pro fim)
    groups.sort((a, b) => {
      const da = a.peneira?.data ? new Date(a.peneira.data).getTime() : 0;
      const db = b.peneira?.data ? new Date(b.peneira.data).getTime() : 0;
      return db - da;
    });

    return groups;
  });
