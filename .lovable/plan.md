## 1. Aba Candidatos → perfil do atleta + chat

Em `src/routes/candidatos.index.tsx`:

- Em cada linha/card do candidato, se `c.user_id` existir, transformar nome/avatar em `<Link to="/atletas/$atletaId" params={{ atletaId: c.user_id }}>`. Sem `user_id`, manter o nome como texto puro (sem link, sem botão de chat) — conforme escolhido.
- Adicionar uma nova coluna "Ações" na tabela (visível só para `admin`/`clube`) com:
  - Botão **Ver perfil** → `/atletas/$atletaId`
  - Botão **Chat** (ícone `MessageSquarePlus`, `aria-label="Iniciar conversa"`) que chama `startConversation(user_id)` de `src/lib/chat.ts` e navega para `/chat`. Reaproveita a lógica já usada em `atletas.$atletaId.tsx`.
- Mesma dupla de ações nos cards do `ClubeCardsView` (apenas quando `user_id` existe). Manter o fluxo de "Desbloquear contato" intacto.

Sem mudanças de backend — `conversations` já só aceita iniciador admin/clube, então a restrição de papéis fica garantida tanto no UI quanto na RLS.

## 2. Perfil do atleta — novos campos

Migração no Supabase adicionando colunas opcionais em `public.profiles`:

- `bio text`
- `historico_clubes jsonb default '[]'::jsonb` — array de `{ clube, periodo, descricao }`
- `stats jsonb default '{}'::jsonb` — `{ jogos, gols, assistencias, titulos }`

Sem novas tabelas, sem novas policies (as existentes em `profiles` já cobrem leitura por dono, peer de chat, admin/clube e suporte).

### UI

`src/routes/atletas.$atletaId.tsx` (visualização pública):
- Nova seção **Sobre** com a bio (texto longo) quando preenchida.
- Nova seção **Estatísticas** em grid (Jogos / Gols / Assistências / Títulos).
- Nova seção **Histórico de clubes** em lista vertical (clube + período + descrição).

`src/routes/perfil.tsx` (edição pelo próprio atleta):
- Textarea para bio.
- Inputs numéricos para as 4 stats.
- Editor simples de histórico de clubes (lista com adicionar/remover linha).
- Salva via `supabase.from("profiles").update(...)`.

## 3. Acessibilidade

Novo componente `src/components/AccessibilityControls.tsx` exibido no topo do perfil do atleta (`atletas.$atletaId.tsx`) com 3 controles persistidos em `localStorage`:

- **Tamanho da fonte**: botões `A-` / `A` / `A+` aplicando classe `text-base|text-lg|text-xl` no container principal do perfil.
- **Alto contraste**: toggle que adiciona a classe `a11y-high-contrast` no container — definida em `src/styles.css` sobrescrevendo `--background`, `--foreground`, `--card`, `--border`, `--primary` para tokens de máximo contraste.
- **Legendas/descrição em vídeos**: toggle que, quando ativo, faz `AthleteVideoGallery` mostrar título + descrição abaixo de cada vídeo, garante `controls` e `tabIndex={0}` no `<video>`, e adiciona `aria-label` descritivo. Estado lido via prop ou contexto leve.

Ajustes de a11y adicionais no perfil:
- Botão "Voltar" com `aria-label`.
- Garantir `alt` no avatar (já vem do componente).
- Tap targets dos botões de ação ≥ 44px (`min-h-11`).

## Arquivos

- **Editar**: `src/routes/candidatos.index.tsx`, `src/routes/atletas.$atletaId.tsx`, `src/routes/perfil.tsx`, `src/components/AthleteVideoGallery.tsx`, `src/styles.css`, `src/integrations/supabase/types.ts` (regenerado após migração).
- **Criar**: `src/components/AccessibilityControls.tsx`.
- **Migração**: adicionar `bio`, `historico_clubes`, `stats` em `public.profiles`.
