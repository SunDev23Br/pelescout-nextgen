export type Posicao =
  | "Goleiro"
  | "Zagueiro"
  | "Lateral"
  | "Volante"
  | "Meia"
  | "Atacante";

export type StatusPeneira = "aberta" | "em_andamento" | "encerrada";

export interface Peneira {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  local: string;
  data: string; // ISO
  horario: string;
  vagas: number;
  inscritos: number;
  categorias: string[];
  status: StatusPeneira;
  imagem: string;
  descricao: string;
  organizador: string;
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
  idade: number;
  posicao: Posicao;
  cidade: string;
  altura: number; // cm
  peso: number; // kg
  pe: "Destro" | "Canhoto";
  avatar: string;
  peneiraId: string;
  avaliacao?: Avaliacao;
  notaGeral?: number;
  comentario?: string;
  status: "pendente" | "avaliado" | "aprovado" | "reprovado";
}

export const peneiras: Peneira[] = [
  {
    id: "p1",
    titulo: "Peneira Sub-17 — Centro de Treinamento Pelé",
    cidade: "Santos",
    estado: "SP",
    local: "CT Rei Pelé — Vila Belmiro",
    data: "2026-05-18",
    horario: "08:00",
    vagas: 80,
    inscritos: 64,
    categorias: ["Sub-15", "Sub-17"],
    status: "aberta",
    imagem:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Seletiva oficial para a base do Santos. Avaliações técnicas, físicas e jogos coletivos com presença de olheiros profissionais.",
    organizador: "Pelé Next Gen",
  },
  {
    id: "p2",
    titulo: "Seletiva Nacional Sub-20",
    cidade: "Belo Horizonte",
    estado: "MG",
    local: "Estádio Independência",
    data: "2026-06-02",
    horario: "09:30",
    vagas: 120,
    inscritos: 47,
    categorias: ["Sub-19", "Sub-20"],
    status: "aberta",
    imagem:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Grande seletiva com clubes da Série A presentes. Ideal para atletas que buscam contrato profissional.",
    organizador: "Pelé Next Gen",
  },
  {
    id: "p3",
    titulo: "Peneira Goleiros — Categorias de Base",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    local: "Maracanãzinho de Areia",
    data: "2026-05-25",
    horario: "14:00",
    vagas: 30,
    inscritos: 30,
    categorias: ["Sub-15", "Sub-17", "Sub-20"],
    status: "em_andamento",
    imagem:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Avaliação especializada para goleiros, com testes de reflexo, jogo aéreo e construção de jogo.",
    organizador: "Pelé Next Gen",
  },
  {
    id: "p4",
    titulo: "Peneira Regional Nordeste",
    cidade: "Recife",
    estado: "PE",
    local: "Arena de Pernambuco",
    data: "2026-04-10",
    horario: "08:30",
    vagas: 100,
    inscritos: 100,
    categorias: ["Sub-17", "Sub-20"],
    status: "encerrada",
    imagem:
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Etapa regional concluída. Resultados disponíveis na área do atleta.",
    organizador: "Pelé Next Gen",
  },
  {
    id: "p5",
    titulo: "Peneira Sub-13 — Talentos do Amanhã",
    cidade: "Curitiba",
    estado: "PR",
    local: "CT do Caju",
    data: "2026-07-12",
    horario: "09:00",
    vagas: 60,
    inscritos: 22,
    categorias: ["Sub-13"],
    status: "aberta",
    imagem:
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1200&q=80&auto=format&fit=crop",
    descricao:
      "Categoria iniciante com foco em fundamentos. Acompanhamento pedagógico durante o dia.",
    organizador: "Pelé Next Gen",
  },
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

export const candidatos: Candidato[] = nomes.map((nome, i) => {
  const peneira = peneiras[i % peneiras.length];
  const avaliado = i % 3 !== 0;
  const av: Avaliacao | undefined = avaliado
    ? {
        tecnica: 6 + Math.round(Math.random() * 35) / 10,
        fisico: 6 + Math.round(Math.random() * 35) / 10,
        tatico: 6 + Math.round(Math.random() * 35) / 10,
        psicologico: 6 + Math.round(Math.random() * 35) / 10,
      }
    : undefined;
  const notaGeral = av
    ? Math.round(((av.tecnica + av.fisico + av.tatico + av.psicologico) / 4) * 10) / 10
    : undefined;
  return {
    id: `c${i + 1}`,
    nome,
    idade: 14 + (i % 7),
    posicao: posicoes[i % posicoes.length],
    cidade: cidades[i % cidades.length],
    altura: 165 + (i % 25),
    peso: 58 + (i % 22),
    pe: i % 4 === 0 ? "Canhoto" : "Destro",
    avatar: `https://i.pravatar.cc/150?img=${i + 12}`,
    peneiraId: peneira.id,
    avaliacao: av,
    notaGeral,
    comentario: avaliado
      ? "Boa leitura de jogo, precisa melhorar finalização sob pressão."
      : undefined,
    status: avaliado ? (notaGeral! >= 8 ? "aprovado" : "avaliado") : "pendente",
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

export const statusLabel: Record<StatusPeneira, string> = {
  aberta: "Inscrições abertas",
  em_andamento: "Em andamento",
  encerrada: "Encerrada",
};
