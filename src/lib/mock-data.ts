export type Posicao =
  | "Goleiro"
  | "Zagueiro"
  | "Lateral"
  | "Volante"
  | "Meia"
  | "Atacante";

export type StatusPeneira = "aberta" | "em_andamento" | "encerrada";
export type Visibilidade = "publica" | "privada";

/** Preço, em reais, que um clube paga para desbloquear contato de 1 atleta aprovado. */
export const PRECO_CONTATO_BRL = 49.9;

export interface Jogo {
  /** ex: "1", "2", ... */
  numero: number;
  /** "12:00" */
  horario: string;
  /** ids de candidatos participando */
  candidatoIds: string[];
}

export interface Peneira {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  local: string;
  data: string; // ISO
  /** janela de operação do campo */
  horaInicio: string; // "15:00"
  horaFim: string; // "21:00"
  /** duração de cada jogo em minutos */
  duracaoJogoMin: number;
  /** participantes por jogo (ex: 22) */
  participantesPorJogo: number;
  /** Hora limite para inscrição (ISO local). */
  limiteInscricao: string;
  vagas: number; // calculado: jogos * participantesPorJogo
  inscritos: number;
  jogos: Jogo[];
  categorias: string[];
  status: StatusPeneira;
  visibilidade: Visibilidade;
  /** Token de convite para olheiros (gerado quando privada). */
  inviteToken?: string;
  imagem: string;
  descricao: string;
  organizador: string;
  /** Compat: para exibir no card. */
  horario: string;
}

export interface Avaliacao {
  tecnica: number;
  fisico: number;
  tatico: number;
  psicologico: number;
}

export interface Candidato {
  id: string;
  nome: string;
  /** Data de nascimento no formato ISO YYYY-MM-DD. */
  dataNascimento: string;
  posicao: Posicao;
  cidade: string;
  altura: number; // cm
  peso: number; // kg
  pe: "Destro" | "Canhoto";
  avatar: string;
  /** Dados de contato — visíveis para admin; bloqueados para clubes sem pagamento. */
  email: string;
  celular: string;
  peneiraId: string;
  /** ID do usuário no Supabase (auth.users.id), quando o candidato tem conta. */
  userId?: string;
  avaliacao?: Avaliacao;
  notaGeral?: number;
  comentario?: string;
  status: "pendente" | "avaliado" | "aprovado" | "reprovado";
}

/* ---------------- Cálculo de jogos / vagas ---------------- */

/** Quantos jogos cabem na janela do dia. */
export function calcularJogos(
  horaInicio: string,
  horaFim: string,
  duracaoMin: number,
): number {
  if (!horaInicio || !horaFim || !duracaoMin) return 0;
  const [h1, m1] = horaInicio.split(":").map(Number);
  const [h2, m2] = horaFim.split(":").map(Number);
  const minutos = h2 * 60 + m2 - (h1 * 60 + m1);
  if (minutos <= 0) return 0;
  return Math.floor(minutos / duracaoMin);
}

export function calcularVagas(
  horaInicio: string,
  horaFim: string,
  duracaoMin: number,
  participantesPorJogo: number,
): number {
  return calcularJogos(horaInicio, horaFim, duracaoMin) * participantesPorJogo;
}

/** Gera horários de cada jogo com base nos parâmetros. */
function gerarJogos(
  horaInicio: string,
  duracaoMin: number,
  totalJogos: number,
  participantesPorJogo: number,
  candidatoIds: string[],
): Jogo[] {
  const [h, m] = horaInicio.split(":").map(Number);
  const inicioMin = h * 60 + m;
  const jogos: Jogo[] = [];
  for (let i = 0; i < totalJogos; i++) {
    const t = inicioMin + i * duracaoMin;
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    const slice = candidatoIds.slice(
      i * participantesPorJogo,
      (i + 1) * participantesPorJogo,
    );
    jogos.push({ numero: i + 1, horario: `${hh}:${mm}`, candidatoIds: slice });
  }
  return jogos;
}

/* ---------------- Dados mockados ---------------- */

const mkPeneira = (
  base: Omit<
    Peneira,
    "vagas" | "jogos" | "horario" | "duracaoJogoMin" | "participantesPorJogo"
  > & {
    duracaoJogoMin: number;
    participantesPorJogo: number;
    candidatoIds?: string[];
  },
): Peneira => {
  const totalJogos = calcularJogos(base.horaInicio, base.horaFim, base.duracaoJogoMin);
  const vagas = totalJogos * base.participantesPorJogo;
  const jogos = gerarJogos(
    base.horaInicio,
    base.duracaoJogoMin,
    totalJogos,
    base.participantesPorJogo,
    base.candidatoIds ?? [],
  );
  return {
    ...base,
    horario: base.horaInicio,
    duracaoJogoMin: base.duracaoJogoMin,
    participantesPorJogo: base.participantesPorJogo,
    vagas,
    jogos,
  };
};

export const peneiras: Peneira[] = [
  mkPeneira({
    id: "p1",
    titulo: "Peneira Sub-17 — Centro de Treinamento Pelé",
    cidade: "Santos",
    estado: "SP",
    local: "CT Rei Pelé — Vila Belmiro",
    data: "2026-05-18",
    horaInicio: "08:00",
    horaFim: "14:00",
    duracaoJogoMin: 30,
    participantesPorJogo: 22,
    limiteInscricao: "2026-05-15T23:59",
    inscritos: 64,
    categorias: ["Sub-15", "Sub-17"],
    status: "aberta",
    visibilidade: "publica",
    imagem:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Seletiva oficial para a base do Santos. Avaliações técnicas, físicas e jogos coletivos com presença de olheiros profissionais.",
    organizador: "Pelé Next Gen",
    candidatoIds: ["c1", "c2", "c3", "c4", "c5", "c6"],
  }),
  mkPeneira({
    id: "p2",
    titulo: "Seletiva Nacional Sub-20",
    cidade: "Belo Horizonte",
    estado: "MG",
    local: "Estádio Independência",
    data: "2026-06-02",
    horaInicio: "09:30",
    horaFim: "17:30",
    duracaoJogoMin: 40,
    participantesPorJogo: 22,
    limiteInscricao: "2026-05-30T23:59",
    inscritos: 47,
    categorias: ["Sub-19", "Sub-20"],
    status: "aberta",
    visibilidade: "publica",
    imagem:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Grande seletiva com clubes da Série A presentes. Ideal para atletas que buscam contrato profissional.",
    organizador: "Pelé Next Gen",
    candidatoIds: ["c7", "c8"],
  }),
  mkPeneira({
    id: "p3",
    titulo: "Peneira Goleiros — Categorias de Base",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    local: "Maracanãzinho de Areia",
    data: "2026-05-25",
    horaInicio: "14:00",
    horaFim: "18:00",
    duracaoJogoMin: 30,
    participantesPorJogo: 12,
    limiteInscricao: "2026-05-22T23:59",
    inscritos: 30,
    categorias: ["Sub-15", "Sub-17", "Sub-20"],
    status: "em_andamento",
    visibilidade: "publica",
    imagem:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Avaliação especializada para goleiros, com testes de reflexo, jogo aéreo e construção de jogo.",
    organizador: "Pelé Next Gen",
    candidatoIds: ["c9", "c10"],
  }),
  mkPeneira({
    id: "p4",
    titulo: "Peneira Regional Nordeste",
    cidade: "Recife",
    estado: "PE",
    local: "Arena de Pernambuco",
    data: "2026-04-10",
    horaInicio: "08:30",
    horaFim: "16:30",
    duracaoJogoMin: 30,
    participantesPorJogo: 22,
    limiteInscricao: "2026-04-08T23:59",
    inscritos: 100,
    categorias: ["Sub-17", "Sub-20"],
    status: "encerrada",
    visibilidade: "publica",
    imagem:
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Etapa regional concluída. Resultados disponíveis na área do atleta.",
    organizador: "Pelé Next Gen",
    candidatoIds: ["c11", "c12"],
  }),
  mkPeneira({
    id: "p5",
    titulo: "Peneira Privada — Convidados Cruzeiro",
    cidade: "Curitiba",
    estado: "PR",
    local: "CT do Caju",
    data: "2026-07-12",
    horaInicio: "09:00",
    horaFim: "13:00",
    duracaoJogoMin: 30,
    participantesPorJogo: 22,
    limiteInscricao: "2026-07-10T23:59",
    inscritos: 22,
    categorias: ["Sub-13"],
    status: "aberta",
    visibilidade: "privada",
    inviteToken: "abc123-invite-token",
    imagem:
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Peneira privada para olheiros — apenas olheiros convidados têm acesso. Atletas podem se inscrever normalmente.",
    organizador: "Pelé Next Gen",
  }),
];

const nomes = [
  "Lucas Oliveira",
  "Gabriel Santos",
  "Pedro Almeida",
  "Matheus Costa",
  "João Victor Silva",
  "Bruno Rodrigues",
  "Felipe Souza",
  "Rafael Lima",
  "Henrique Pereira",
  "Vinícius Carvalho",
  "Diego Martins",
  "Eduardo Ferreira",
];

const cidades = [
  "Santos, SP",
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Curitiba, PR",
  "Recife, PE",
  "Salvador, BA",
  "Porto Alegre, RS",
];

const posicoes: Posicao[] = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

const dddByCidade: Record<string, string> = {
  "Santos, SP": "13",
  "São Paulo, SP": "11",
  "Rio de Janeiro, RJ": "21",
  "Belo Horizonte, MG": "31",
  "Curitiba, PR": "41",
  "Recife, PE": "81",
  "Salvador, BA": "71",
  "Porto Alegre, RS": "51",
};

export const candidatos: Candidato[] = nomes.map((nome, i) => {
  const peneira = peneiras[i % peneiras.length];
  const avaliado = i % 3 !== 0;
  const av: Avaliacao | undefined = avaliado
    ? {
        tecnica: 1.5 + Math.round(Math.random() * 35) / 10,
        fisico: 1.5 + Math.round(Math.random() * 35) / 10,
        tatico: 1.5 + Math.round(Math.random() * 35) / 10,
        psicologico: 1.5 + Math.round(Math.random() * 35) / 10,
      }
    : undefined;
  const notaGeral = av
    ? Math.round(((av.tecnica + av.fisico + av.tatico + av.psicologico) / 4) * 10) / 10
    : undefined;
  const cidade = cidades[i % cidades.length];
  const ddd = dddByCidade[cidade] ?? "11";
  const numero = `9${String(80000000 + i * 1234567).slice(0, 8)}`;
  const primeiroNome = nome.split(" ")[0].toLowerCase();
  const idadeMock = 14 + (i % 7);
  const hoje = new Date();
  const dataNasc = new Date(hoje.getFullYear() - idadeMock, hoje.getMonth(), hoje.getDate());
  const dataNascimento = `${dataNasc.getFullYear()}-${String(dataNasc.getMonth() + 1).padStart(2, "0")}-${String(dataNasc.getDate()).padStart(2, "0")}`;
  return {
    id: `c${i + 1}`,
    nome,
    dataNascimento,
    posicao: posicoes[i % posicoes.length],
    cidade,
    altura: 165 + (i % 25),
    peso: 58 + (i % 22),
    pe: i % 4 === 0 ? "Canhoto" : "Destro",
    avatar: "",
    email: `${primeiroNome}.${i + 1}@email.com`,
    celular: `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5, 9)}`,
    peneiraId: peneira.id,
    avaliacao: av,
    notaGeral,
    comentario: avaliado
      ? "Boa leitura de jogo, precisa melhorar finalização sob pressão."
      : undefined,
    status: avaliado ? (notaGeral! >= 3 ? "aprovado" : "avaliado") : "pendente",
  };
});

export function getPeneira(id: string) {
  return peneiras.find((p) => p.id === id);
}

export function getCandidato(id: string) {
  return candidatos.find((c) => c.id === id);
}

export function getCandidatosPorPeneira(peneiraId: string) {
  return candidatos.filter((c) => c.peneiraId === peneiraId);
}

/** Retorna os candidatos participantes de um jogo específico. */
export function getCandidatosDoJogo(peneiraId: string, jogoNumero: number): Candidato[] {
  const p = getPeneira(peneiraId);
  if (!p) return [];
  const jogo = p.jogos.find((j) => j.numero === jogoNumero);
  if (!jogo) return [];
  // Se o jogo está vazio (peneira sem inscritos no mock), distribui automaticamente.
  if (jogo.candidatoIds.length === 0) {
    return getCandidatosPorPeneira(peneiraId);
  }
  return jogo.candidatoIds
    .map((id) => getCandidato(id))
    .filter((c): c is Candidato => Boolean(c));
}

export const statusLabel: Record<StatusPeneira, string> = {
  aberta: "Inscrições abertas",
  em_andamento: "Em andamento",
  encerrada: "Encerrada",
};
