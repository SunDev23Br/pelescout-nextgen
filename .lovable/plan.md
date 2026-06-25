# Plano: Títulos selecionáveis + Histórico no perfil do atleta

## 1. Edição em `/perfil` (aba "Histórico / Estatísticas")

Substituir o campo numérico **Títulos** por uma lista de títulos conquistados. Cada item:

- **Campeonato** (select com busca, lista curada abaixo + opção "Outro" → input livre)
- **Ano** (input numérico, 1990–ano atual)
- **Time** (input texto — autocomplete com os clubes já adicionados em "Clubes por onde passou")

Botões "Adicionar título" e remover por linha, mesmo padrão visual do bloco de clubes já existente.

A contagem total de títulos (`stats.titulos`) passa a ser derivada (`titulos_lista.length`) — mantém compatibilidade com leituras antigas.

### Lista curada de campeonatos (sub-13 a sub-20)

Agrupada no select:

```text
Internacionais
  - Mundial Sub-20 (FIFA)
  - Mundial Sub-17 (FIFA)
  - Sul-Americano Sub-20
  - Sul-Americano Sub-17
  - Sul-Americano Sub-15
  - Libertadores Sub-20
  - Dallas Cup
  - Nike Premier Cup

Nacionais
  - Campeonato Brasileiro Sub-20
  - Campeonato Brasileiro Sub-17
  - Campeonato Brasileiro Sub-15
  - Copa do Brasil Sub-20
  - Copa do Brasil Sub-17
  - Brasileirão de Aspirantes
  - Supercopa do Brasil Sub-20
  - Supercopa do Brasil Sub-17

Copas de base tradicionais
  - Copa São Paulo de Futebol Júnior (Copinha) — Sub-20
  - Taça BH — Sub-17
  - Taça BH — Sub-15
  - Copa 2 de Julho — Sub-15
  - Copa Votorantim — Sub-15
  - Copa Atlântico Sub-20
  - Copa RS Sub-20 / Sub-17
  - Copa do Nordeste Sub-20 / Sub-17

Estaduais (Sub-13 / Sub-15 / Sub-17 / Sub-20)
  - Campeonato Paulista (sub-13 a sub-20)
  - Campeonato Carioca (sub-13 a sub-20)
  - Campeonato Mineiro (sub-13 a sub-20)
  - Campeonato Gaúcho (sub-13 a sub-20)
  - Campeonato Paranaense (sub-13 a sub-20)
  - Campeonato Catarinense (sub-13 a sub-20)
  - Campeonato Baiano (sub-13 a sub-20)
  - Campeonato Pernambucano (sub-13 a sub-20)
  - Campeonato Cearense (sub-13 a sub-20)
  - Campeonato Goiano (sub-13 a sub-20)
  - (demais estados disponíveis via "Outro")

Outro
  - Campo livre para digitar
```

## 2. Exibição em `/perfil-atleta` (e `/atletas/$atletaId`, mesmo componente de leitura)

Adicionar duas seções dedicadas, logo abaixo do bloco "Sobre / Habilidades":

**Clubes por onde passou** — renderiza `historico_clubes` como uma timeline simples (nome do clube em destaque, período em texto secundário, descrição opcional). Se vazio, esconde a seção.

**Títulos conquistados** — renderiza `stats.titulos_lista` como cards/linhas: nome do campeonato (destaque), ano e time (linha secundária). Ordenado por ano desc. Se vazio, esconde.

A grade "Conquistas" existente continua, mas passa a usar o `titulos_lista.length` como total e mostra o título mais recente como sub-label.

## 3. Persistência

Sem migração de schema — usa o jsonb `stats` já existente em `profiles`.

```ts
stats = {
  ...existentes,
  titulos: number,                              // mantido (derivado)
  titulos_lista: Array<{
    campeonato: string;
    ano: number;
    time: string;
  }>
}
```

Leituras antigas (apenas `titulos` numérico) continuam funcionando — a UI nova só exibe a lista quando `titulos_lista` existe.

## Arquivos afetados

- `src/routes/perfil.tsx` — substitui input numérico por editor de lista; salva `titulos_lista` em `stats`.
- `src/routes/perfil-atleta.tsx` — adiciona seções "Clubes" e "Títulos".
- `src/routes/atletas.$atletaId.tsx` — mesmo tratamento de leitura (verificar se usa o mesmo componente; se não, replicar as duas seções).
- `src/lib/campeonatos.ts` (novo) — constante com a lista curada acima.

## Fora de escopo

- Sem mudança de schema/migration.
- Sem alterações em `cadastro`, dashboard, candidatos ou avaliações.
- Sem upload de medalhas/imagens.
