# Avaliações ao vivo → persistência, nota geral e e-mail

## 1. Banco de dados (migration)

Ajustar `public.avaliacoes` para suportar todas as métricas e ambos os alvos (candidato em peneira ou atleta cadastrado):

- Tornar `candidato_id` opcional (nullable).
- Adicionar colunas: `atleta_user_id uuid` (FK para `profiles.id`), `peneira_id uuid`, `intensidade numeric`, `mental numeric`, `nota_geral numeric`, `decisao text` (aprovado/reprovado/reavaliar), `tags_positivas text[]`, `tags_negativas text[]`, `pe_bonus numeric`.
- Renomear semanticamente: usar `tecnica`, `tatico`, `fisico` já existentes; mapear `mental` (novo) e manter `psicologico` para compatibilidade.
- Constraint: pelo menos um entre `candidato_id` e `atleta_user_id` deve estar preenchido.
- RLS:
  - Avaliador (admin) pode inserir/ler suas próprias avaliações.
  - Atleta pode ler avaliações que tenham `atleta_user_id = auth.uid()` ou `candidato_id` ligado ao seu `user_id`.
  - Clube: sem acesso (já bloqueado na UI).
- Trigger `tg_set_updated_at` no update.

## 2. Backend — server function de salvar avaliação

Criar `src/lib/avaliacoes.functions.ts` com `salvarAvaliacao` (`createServerFn` + `requireSupabaseAuth`):
1. Valida input (zod): scores, tags, comentário, decisão, alvo (candidato_id OU atleta_user_id), peneira_id opcional.
2. Calcula `nota_geral` = média dos 5 scores + `pe_bonus`.
3. Insere em `avaliacoes`.
4. Se `candidato_id`: atualiza `candidatos.nota_geral` e `candidatos.status` conforme decisão.
5. Resolve e-mail do atleta (de `candidatos.email` ou `profiles.email` via admin client).
6. Dispara e-mail via `/lovable/email/transactional/send` com `templateName: 'avaliacao-atleta'`, `idempotencyKey: avaliacao-${id}`, e os dados da avaliação.
7. Retorna `{ id, nota_geral }`.

## 3. E-mail (Lovable Emails padrão)

- Rodar `setup_email_infra` + `scaffold_transactional_email` (intermediários, sem parar).
- Criar template `src/lib/email-templates/avaliacao-atleta.tsx` (React Email) com:
  - Saudação ao atleta, nome do avaliador, data, peneira (se houver).
  - Nota geral em destaque, breakdown das 5 métricas, decisão (badge), tags positivas/negativas, comentário do olheiro.
  - Estilo alinhado ao app (tokens lidos de `src/styles.css`).
- Registrar em `src/lib/email-templates/registry.ts`.

## 4. UI — `/avaliacoes`

- No `salvar()`, chamar o server fn com payload completo; mostrar loading e toast de sucesso/erro.
- Bloquear botão enquanto envia.
- Passar `candidato_id` quando uma peneira está selecionada; `atleta_user_id` quando "Todos os atletas".

## 5. UI — `/candidatos` (lista)

- Já lê `candidatos`; passar a exibir `nota_geral` (badge "Nota X.X") no card de cada candidato quando existir.
- Atualizar a query para incluir esse campo (se faltar) e refazer fetch após salvar.

## 6. UI — `/atletas/$atletaId`

- Buscar última avaliação do atleta (`avaliacoes` por `atleta_user_id` OU `candidato_id` em `candidatos.user_id = atletaId`).
- Exibir bloco "Nota geral" com o valor mais recente, no padrão de design existente da página.

## Resumo técnico

| Camada | Arquivo |
|---|---|
| Migration | nova migration de `avaliacoes` |
| Server fn | `src/lib/avaliacoes.functions.ts` |
| Email template | `src/lib/email-templates/avaliacao-atleta.tsx` + `registry.ts` |
| UI | `src/routes/avaliacoes.tsx`, `src/routes/candidatos.index.tsx`, `src/routes/atletas.$atletaId.tsx` |
| Infra email | `setup_email_infra` + `scaffold_transactional_email` |

Não há alterações no chat, perfis, cadastro ou outras rotas.
