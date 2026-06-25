/**
 * Lista curada de campeonatos de base (Sub-13 a Sub-20) relevantes
 * para atletas brasileiros. Agrupada por categoria para uso em <optgroup>.
 */

export interface CampeonatoGroup {
  group: string;
  items: string[];
}

const ESTADOS_BASE = [
  "Paulista",
  "Carioca",
  "Mineiro",
  "Gaúcho",
  "Paranaense",
  "Catarinense",
  "Baiano",
  "Pernambucano",
  "Cearense",
  "Goiano",
  "Capixaba",
  "Fluminense",
  "Sergipano",
  "Potiguar",
  "Paraibano",
  "Alagoano",
  "Maranhense",
  "Piauiense",
  "Amazonense",
  "Paraense",
  "Mato-grossense",
  "Sul-Mato-Grossense",
  "Brasiliense (DF)",
];

const CATEGORIAS = ["Sub-11", "Sub-12", "Sub-13", "Sub-15", "Sub-17", "Sub-20"];

const ESTADUAIS: string[] = ESTADOS_BASE.flatMap((uf) =>
  CATEGORIAS.map((cat) => `Campeonato ${uf} ${cat}`),
);

export const CAMPEONATOS: CampeonatoGroup[] = [
  {
    group: "Internacionais",
    items: [
      "Copa do Mundo FIFA Sub-20",
      "Copa do Mundo FIFA Sub-17",
      "Sul-Americano Sub-20",
      "Sul-Americano Sub-17",
      "Sul-Americano Sub-15",
      "Libertadores Sub-20",
      "Dallas Cup",
      "Nike Premier Cup",
      "Mundial de Clubes Sub-17",
    ],
  },
  {
    group: "Nacionais",
    items: [
      "Campeonato Brasileiro Sub-20",
      "Campeonato Brasileiro Sub-17",
      "Campeonato Brasileiro Sub-15",
      "Copa do Brasil Sub-20",
      "Copa do Brasil Sub-17",
      "Brasileirão de Aspirantes",
      "Supercopa do Brasil Sub-20",
      "Supercopa do Brasil Sub-17",
      "Brasileirão de Clubes Formadores Sub-11",
      "Brasileirão de Clubes Formadores Sub-12",
    ],
  },
  {
    group: "Copas de base tradicionais",
    items: [
      "Copa São Paulo de Futebol Júnior (Copinha) — Sub-20",
      "Taça BH Sub-17",
      "Taça BH Sub-15",
      "Taça BH Sub-12",
      "Taça BH Sub-11",
      "Copa 2 de Julho Sub-15",
      "Copa 2 de Julho Sub-12",
      "Copa 2 de Julho Sub-11",
      "Copa Votorantim Sub-15",
      "Copa Votorantim Sub-12",
      "Copa Votorantim Sub-11",
      "Copa Atlântico Sub-20",
      "Copa RS Sub-20",
      "Copa RS Sub-17",
      "Copa do Nordeste Sub-20",
      "Copa do Nordeste Sub-17",
      "Copa Brasil Kids Sub-11",
      "Copa Brasil Kids Sub-12",
      "Mundialito de Clubes Sub-12",
      "IberCup Sub-11",
      "IberCup Sub-12",
      "Danone Nations Cup Sub-12",
    ],
  },
  {
    group: "Estaduais",
    items: ESTADUAIS,
  },
];

export const CAMPEONATOS_FLAT: string[] = CAMPEONATOS.flatMap((g) => g.items);
