import { supabase } from "@/integrations/supabase/client";
import {
  calcularJogos,
  type Peneira,
  type StatusPeneira,
  type Visibilidade,
} from "@/lib/mock-data";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80";

function gerarJogos(
  horaInicio: string,
  duracaoMin: number,
  totalJogos: number,
) {
  const [h, m] = horaInicio.split(":").map(Number);
  const inicioMin = (h || 0) * 60 + (m || 0);
  const jogos = [];
  for (let i = 0; i < totalJogos; i++) {
    const t = inicioMin + i * duracaoMin;
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    jogos.push({ numero: i + 1, horario: `${hh}:${mm}`, candidatoIds: [] });
  }
  return jogos;
}

export function rowToPeneira(row: any): Peneira {
  const totalJogos = calcularJogos(
    row.hora_inicio,
    row.hora_fim,
    row.duracao_jogo_min,
  );
  const vagas = totalJogos * row.participantes_por_jogo;
  return {
    id: row.id,
    titulo: row.titulo,
    cidade: row.cidade,
    estado: row.estado,
    local: row.local,
    data: row.data,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    duracaoJogoMin: row.duracao_jogo_min,
    participantesPorJogo: row.participantes_por_jogo,
    limiteInscricao: row.limite_inscricao,
    vagas,
    inscritos: row.inscritos ?? 0,
    jogos: gerarJogos(row.hora_inicio, row.duracao_jogo_min, totalJogos),
    categorias: row.categorias ?? [],
    status: (row.status ?? "aberta") as StatusPeneira,
    visibilidade: (row.visibilidade ?? "publica") as Visibilidade,
    inviteToken: row.invite_token ?? undefined,
    imagem: row.imagem || DEFAULT_IMAGE,
    descricao: row.descricao ?? "",
    organizador: row.organizador ?? "Pelé Next Gen",
    horario: row.hora_inicio,
  };
}

export async function fetchPeneirasFromDb(): Promise<Peneira[]> {
  const { data, error } = await supabase
    .from("peneiras")
    .select("*")
    .order("data", { ascending: true });
  if (error) {
    console.error("[peneiras.db] fetch error:", error);
    return [];
  }
  return (data ?? []).map(rowToPeneira);
}

export async function fetchPeneiraById(id: string): Promise<Peneira | null> {
  const { data, error } = await supabase
    .from("peneiras")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToPeneira(data);
}
