## 1) Adicionar Sub-11 e Sub-12 aos campeonatos

**Arquivo:** `src/lib/campeonatos.ts`

- Acrescentar `"Sub-11"` e `"Sub-12"` no array `CATEGORIAS` (gera automaticamente todos os estaduais Sub-11/Sub-12 para os 23 estados já listados).
- Adicionar entradas Sub-11/Sub-12 nos grupos "Nacionais" e "Copas de base tradicionais" onde fazem sentido:
  - Nacionais: `Campeonato Brasileiro Sub-13` continua, adicionar referência a "Brasileirão de Clubes Formadores Sub-11" e "Sub-12" (formato comum em torneios de base).
  - Copas tradicionais: `Taça BH Sub-11`, `Taça BH Sub-12`, `Copa Brasil Kids Sub-11`, `Copa Brasil Kids Sub-12`, `Copa 2 de Julho Sub-11/Sub-12`, `Copa Votorantim Sub-11/Sub-12`, `Mundialito de Clubes Sub-12`, `IberCup Sub-11/Sub-12`, `Danone Nations Cup Sub-12`.
- Sem mudanças em UI — o `<optgroup>` no `/perfil` já consome `CAMPEONATOS`.

## 2) Aba "Desempenho" no perfil do atleta

**Objetivo:** o atleta vê todas as peneiras em que participou via Pelé Next Gen, com feedback do olheiro e métricas gráficas.

### Fonte de dados (já existe, sem migration)
- `candidatos` (filtrado por `user_id = auth.uid()`) → peneira inscrita, status, nota_geral.
- `peneiras` → título, clube_id, data_evento, local.
- `avaliacoes` (RLS já permite leitura quando `atleta_user_id = auth.uid()` OU candidato vinculado) → tecnica, fisico, tatico, mental, intensidade, pe_bonus, nota_geral, decisao, tags_positivas/negativas, comentario, created_at.

### Server function nova
**Arquivo:** `src/lib/desempenho.functions.ts` (novo)
- `getMeuDesempenho` com `requireSupabaseAuth`. Retorna lista ordenada por data:
  ```ts
  Array<{
    candidato_id, peneira: { id, titulo, data_evento, local, clube_nome },
    status, nota_geral_candidato,
    avaliacoes: Array<{ tecnica, fisico, tatico, mental, intensidade, pe_bonus, nota_geral, decisao, tags_positivas, tags_negativas, comentario, created_at, avaliador_nome }>
  }>
  ```
- Faz join `candidatos → peneiras → profiles(clube)` e segundo SELECT em `avaliacoes` por `candidato_id IN (...)` e também por `atleta_user_id = userId` (cobre avaliações sem candidato).

### UI
**Arquivo:** `src/routes/perfil-atleta.tsx`
- Envolver o conteúdo atual em `<Tabs>` (shadcn) com duas abas: **"Perfil"** (conteúdo atual) e **"Desempenho"** (nova).
- Aba Desempenho:
  - **Resumo no topo (4 cards):** total de peneiras, aprovações, nota média geral, posição mais avaliada.
  - **Gráfico radar agregado** (recharts, já instalado) com média dos 6 atributos (técnico, físico, tático, mental, intensidade, pé) entre todas as avaliações.
  - **Gráfico de linha** (`LineChart`) mostrando evolução da `nota_geral` ao longo do tempo (eixo X = data, Y = 0–10).
  - **Distribuição de decisões** (`BarChart` ou pizza pequena): aprovado / em análise / rejeitado.
  - **Lista de peneiras** (cards expansíveis/acordeão):
    - Cabeçalho: título da peneira, clube, data, badge de status, nota geral.
    - Expandido: radar individual da avaliação, tags positivas (verde) e negativas (vermelho) como chips, comentário do olheiro, decisão, data da avaliação. Se múltiplas avaliações, lista cada uma.
  - **Empty state:** "Você ainda não participou de peneiras. Explore peneiras disponíveis →" com link para `/peneiras`.

### Componente novo
**Arquivo:** `src/components/desempenho/DesempenhoTab.tsx` — encapsula toda a aba (resumo, gráficos, lista).
**Arquivo:** `src/components/desempenho/AvaliacaoRadar.tsx` — radar reutilizável (recharts `RadarChart`).

### Fora de escopo
- Sem mudanças em `cadastro`, `candidatos`, criação de peneira, avaliação do olheiro.
- Sem migration/RLS — políticas já cobrem o acesso do atleta.
- Sem alterações em `/atletas/$atletaId` (visão de olheiros/clubes) — a aba é apenas para o próprio atleta.
