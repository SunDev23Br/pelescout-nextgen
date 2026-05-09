## Objetivo

Hoje a tela `/peneiras` lista somente peneiras do mock (`src/lib/mock-data.ts`). Quando o usuário cria uma peneira, ela vai pro banco mas não aparece na listagem. Vamos puxar as peneiras do banco e misturá-las com as do mock para que apareçam.

## Como vai funcionar

1. Criar `src/lib/peneiras.db.ts` com `fetchPeneirasFromDb()` que lê a tabela `peneiras` (já protegida por RLS) e converte cada linha para o tipo `Peneira` do mock — usando `mkPeneira`-like para gerar `jogos`/`vagas`/`horario` a partir de `hora_inicio`, `hora_fim`, `duracao_jogo_min`, `participantes_por_jogo`.

2. Em `src/routes/peneiras.index.tsx`:
   - Carregar peneiras do banco com `useEffect` + `useState` (e re-buscar no `png-session` event ou após delete).
   - Exibir `[...mockPeneiras, ...peneirasDoBanco]` na lista, ordenando por `data` ascendente.
   - Mostrar imagem default (placeholder) caso `imagem` venha `null`.

3. Em `src/routes/peneiras.$peneiraId.tsx`:
   - Se `getPeneira(id)` (mock) não achar, buscar no banco por id.
   - Renderiza com mesmos campos.

4. Após `criarPeneira()` em `peneiras.criar.tsx`, ao redirecionar pra `/peneiras`, a listagem busca novamente — já cobre.

5. O delete em `peneiras.index.tsx` continua chamando `supabase.from("peneiras").delete()` (já existe). Adicionar refresh após delete.

## Mapeamento DB → Peneira

| Coluna DB | Campo Peneira |
|---|---|
| `id` | `id` |
| `titulo` | `titulo` |
| `cidade`, `estado`, `local` | mesmos |
| `data` | `data` |
| `hora_inicio`/`hora_fim` | `horaInicio`/`horaFim` |
| `duracao_jogo_min` | `duracaoJogoMin` |
| `participantes_por_jogo` | `participantesPorJogo` |
| `limite_inscricao` (timestamptz) | `limiteInscricao` (string ISO) |
| `inscritos` | `inscritos` |
| `categorias` | `categorias` |
| `status` | `status` |
| `visibilidade` | `visibilidade` |
| `invite_token` | `inviteToken` |
| `imagem` | `imagem` (fallback placeholder unsplash) |
| `descricao` | `descricao` (fallback "") |
| `organizador` | `organizador` |

`vagas`, `jogos` e `horario` são derivados (mesma lógica do `mkPeneira`).

## Fora de escopo

- Não migrar mocks pro banco. Mocks continuam aparecendo junto com os do DB (demo).
- Inscrições/avaliações por peneira do banco — fica para depois.

## Arquivos

- criar: `src/lib/peneiras.db.ts`
- editar: `src/routes/peneiras.index.tsx`, `src/routes/peneiras.$peneiraId.tsx`
