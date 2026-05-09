## Objetivo

Quando um atleta clicar em "Inscrever-se" numa peneira, criar um registro na tabela `candidatos` ligado ao `peneira_id` e ao `user_id` do atleta logado, e mostrar essa inscrição na UI (botão "Inscrito" + lista de candidatos da peneira para clube/admin). E-mail fica para depois.

## Mudanças no banco

Migration `1` — estender perfil do atleta para conseguir popular `candidatos` automaticamente:

```
ALTER TABLE public.profiles
  ADD COLUMN celular text,
  ADD COLUMN data_nascimento date,
  ADD COLUMN posicao posicao,
  ADD COLUMN cidade text,
  ADD COLUMN altura integer,
  ADD COLUMN peso integer,
  ADD COLUMN pe pe_dominante;
```

(`posicao` e `pe_dominante` já existem como enums no schema. `cidade` é opcional — se a `cidade` não estiver no cadastro, fica `null`/"—" por enquanto.)

Atualizar `handle_new_user()` para também copiar `celular`, `data_nascimento`, `altura`, `peso`, `posicao`, `pe` de `raw_user_meta_data` no signUp.

Migration `2` — garantir que um atleta não se inscreve duas vezes na mesma peneira:

```
CREATE UNIQUE INDEX candidatos_user_peneira_unique
  ON public.candidatos (user_id, peneira_id)
  WHERE user_id IS NOT NULL;
```

## Mudanças no frontend

1. `src/routes/cadastro.tsx`
   - Incluir `celular`, `data_nascimento`, `altura`, `peso`, `posicao`, `pe` no `options.data` do `signUp` para que o trigger `handle_new_user` salve no perfil.

2. `src/lib/inscricoes.ts` (novo) — helpers de inscrição via supabase client (RLS já permite `atleta self insert`):
   - `inscreverNaPeneira(peneiraId)`: lê `auth.uid()`, lê `profiles` do usuário, faz `insert` em `candidatos` com `user_id`, `peneira_id`, `nome`, `email`, `celular`, `data_nascimento`, `posicao`, `cidade`, `altura`, `peso`, `pe`, `status: 'pendente'`. Retorna `{ id }` ou erro.
   - `getMinhaInscricao(peneiraId)`: busca `candidatos` por `user_id + peneira_id`.
   - `listarCandidatosDaPeneira(peneiraId)`: lista para clube/admin.

3. `src/routes/peneiras.$peneiraId.tsx`
   - No `useEffect`, chamar `getMinhaInscricao(peneira.id)` quando `user?.role === "atleta"` e popular `inscrito`.
   - Em `inscrever()`, chamar `inscreverNaPeneira(peneira.id)`. Em sucesso: `setInscrito(true)`, toast. Em erro de unique constraint: marcar como já inscrito.
   - Validar que o perfil do atleta está completo (campos obrigatórios para o `insert`); se faltar, redirecionar para uma página/aviso para completar perfil. Como esses dados agora vêm do cadastro, novos atletas terão tudo. Para usuários existentes mostrar toast: "Complete seu perfil de atleta antes de se inscrever."

4. `src/routes/peneiras.$peneiraId.tsx` (mesma rota, seção do clube/admin)
   - Substituir a lista de candidatos do mock pela lista do banco quando a peneira for do banco. Manter mock quando o id começar com `p` (peneiras de demonstração).

## Out of scope

- Envio de e-mail (será feito depois).
- Edição de perfil do atleta após cadastro (só o trigger no signUp por enquanto).
- Avaliação dos candidatos do banco.

## Arquivos

- migration: estender `profiles` + atualizar `handle_new_user` + unique index em `candidatos`
- criar: `src/lib/inscricoes.ts`
- editar: `src/routes/cadastro.tsx`, `src/routes/peneiras.$peneiraId.tsx`
