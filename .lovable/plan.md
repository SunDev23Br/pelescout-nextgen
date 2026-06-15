
## Objetivo

Coletar mais informações no cadastro do administrador (olheiro) em `/registro-admin` e exibi-las no painel `/suporte` ao revisar a solicitação, incluindo fotos do RG (frente e verso).

## Mudanças no banco

Migration nova:

1. Adicionar colunas em `public.admin_requests`:
   - `celular text` (contato do olheiro)
   - `idade integer` (1–120)
   - `clube_atual text` (clube onde trabalha/trabalhou)
   - `rg_frente_path text` (caminho no Storage)
   - `rg_verso_path text` (caminho no Storage)
2. Criar bucket de Storage **privado** `admin-docs` (via `storage_create_bucket`).
3. Policies em `storage.objects` para `admin-docs`:
   - INSERT: usuário autenticado só pode subir arquivos sob `auth.uid()/...`.
   - SELECT: o dono (`auth.uid() = primeiro segmento do path`) OU `has_role(auth.uid(),'suporte')`.
   - DELETE: somente suporte.
4. Atualizar `approve_admin_request` para permanecer igual (não move arquivos; mantém path).

## Mudanças em `/registro-admin` (`src/routes/registro-admin.tsx`)

Adicionar ao formulário:
- **Celular** (input com máscara simples, validação 10–15 dígitos).
- **Idade** (input number, 18–99).
- **Clube atual/anterior** (input text, 2–120 chars).
- **RG — Frente** (upload de imagem, jpg/png/webp, ≤ 5 MB).
- **RG — Verso** (upload de imagem, jpg/png/webp, ≤ 5 MB).

Validação com `zod` (incluir arquivos: `instanceof(File)` + tamanho + mime).

Fluxo no submit:
1. `supabase.auth.signUp` (como hoje).
2. Upload dos dois arquivos para `admin-docs/{user_id}/rg-frente.<ext>` e `rg-verso.<ext>` (upsert true).
3. Insert em `admin_requests` com `celular`, `idade`, `clube_atual`, `rg_frente_path`, `rg_verso_path`.
4. `supabase.auth.signOut()` e tela de sucesso (mantém o comportamento atual).

Se algum upload falhar: mostrar toast, abortar o insert e impedir a tela de sucesso.

## Mudanças em `/suporte` (`src/routes/suporte.tsx`)

- Ao carregar `admin_requests`, trazer também os novos campos.
- No card de solicitação pendente do tipo "admin", exibir:
  - Celular, idade, clube atual.
  - Miniaturas clicáveis do RG frente e verso, geradas via `getSignedUrl("admin-docs", path, 600)` (helper já existente em `src/lib/storage.ts`).
  - Clique abre o arquivo em nova aba em tamanho real.
- Solicitações `clube` continuam sem essas informações.

## Detalhes técnicos

- Bucket `admin-docs` privado; URLs assinadas com expiração curta (10 min) geradas sob demanda no painel.
- Path no Storage usa `auth.uid()` como prefixo para casar com a RLS.
- Tipos do Supabase serão regenerados após a migration; o código do front que lê os novos campos só é escrito depois disso.
- Nenhuma alteração na lógica de aprovação/recusa — apenas exibição extra.

## Arquivos afetados

- `supabase/migrations/<novo>.sql` (colunas + policies do bucket)
- `src/routes/registro-admin.tsx` (novos campos + uploads)
- `src/routes/suporte.tsx` (exibição dos novos dados na revisão)
