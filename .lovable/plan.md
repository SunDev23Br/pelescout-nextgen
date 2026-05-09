## Objetivo

Manter a coluna `peneiras.inscritos` sincronizada automaticamente com o número real de candidatos inscritos no banco, para que o contador apareça corretamente em todos os lugares do sistema (cards da listagem, página de detalhe, etc.).

Hoje a coluna existe e é exibida em `PeneiraCard` e na página de detalhe, mas começa em `0` e nunca é atualizada quando um atleta se inscreve — por isso peneiras criadas pelo sistema mostram `0/vagas` mesmo com inscrições reais.

## Mudanças

### 1. Migração de banco (Supabase)

- Criar função `public.tg_candidatos_count()` (SECURITY DEFINER) que, em `INSERT`, faz `peneiras.inscritos = inscritos + 1` para o `peneira_id` novo; em `DELETE`, decrementa; em `UPDATE` que mude `peneira_id`, decrementa o antigo e incrementa o novo.
- Criar trigger `candidatos_count_trg` em `AFTER INSERT OR DELETE OR UPDATE OF peneira_id ON public.candidatos`.
- Backfill único: `UPDATE peneiras SET inscritos = (SELECT COUNT(*) FROM candidatos c WHERE c.peneira_id = peneiras.id);` para corrigir os contadores atuais.

### 2. Frontend

- Após inscrição bem-sucedida em `src/routes/peneiras.$peneiraId.tsx`, atualizar o estado local incrementando `peneira.inscritos` para refletir imediatamente, sem precisar recarregar (o banco já estará correto via trigger).
- Nenhuma outra alteração visual: os componentes (`PeneiraCard`, página de detalhe) já leem `peneira.inscritos` da base.

## Fora do escopo

- Não altera RLS, não mexe em `profiles`, não envia e-mail.
- Não altera a aparência dos cards.
