# Plano: Sistema de Chat Profissional

Integração de um chat realtime ao app atual, respeitando os papéis existentes (`atleta`, `admin`/olheiro, `clube`, `suporte`) e a stack TanStack Start + Lovable Cloud (Supabase) já em uso.

## Regras de produto

- **Quem inicia conversa:** apenas `admin` (olheiro) e `clube`.
- **Atleta:** só responde em conversas existentes. UI esconde botão "Nova conversa".
- **Verificação:** clubes precisam ter `clube_requests.status = 'approved'` (já existe). Para olheiros usamos `user_roles.role = 'admin'` (já é aprovado por suporte). Sem verificação → bloqueado para iniciar.
- **Anti-spam:** limite de N mensagens/minuto por remetente; limite de M conversas novas/dia por olheiro/clube; bloqueio impede envio em ambos sentidos.

## Backend (migration Supabase)

Tabelas novas em `public`:

- `conversations` — `id`, `iniciador_id` (olheiro/clube), `atleta_id`, `created_at`, `last_message_at`, `last_message_preview`, índice único (iniciador, atleta).
- `messages` — `id`, `conversation_id`, `sender_id`, `kind` (`text|image|video|file`), `content` (texto), `media_url`, `media_mime`, `media_size`, `created_at`, `read_at`.
- `message_reads` — marca leitura por usuário (para "visualizado").
- `typing_status` — `conversation_id`, `user_id`, `updated_at` (presença de digitação via Realtime broadcast — sem persistir longamente).
- `user_presence` — `user_id`, `last_seen_at`, `is_online` (atualizado por heartbeat do cliente).
- `chat_blocks` — `blocker_id`, `blocked_id`, `created_at`.
- `chat_reports` — `reporter_id`, `reported_id`, `conversation_id`, `motivo`, `created_at`, `status`.
- `chat_rate_limits` — contagens por janela (ou função SQL que consulta `messages`/`conversations`).

RLS:
- Ler `conversations`/`messages` apenas se `auth.uid()` ∈ {iniciador, atleta} da conversa.
- Inserir `conversations`: somente se `has_role(auth.uid(),'admin')` ou `has_role(auth.uid(),'clube')` **e** o alvo for atleta (`has_role(target,'atleta')`) **e** não houver bloqueio.
- Inserir `messages`: usuário precisa ser parte da conversa, não estar bloqueado, e respeitar rate limit (checado em trigger `BEFORE INSERT`).
- `chat_blocks`/`chat_reports`: qualquer usuário autenticado pode criar como `blocker_id = auth.uid()`.

Trigger anti-spam (PL/pgSQL) em `messages`:
- Rejeita se >30 mensagens nos últimos 60s pelo mesmo `sender_id`.
- Rejeita se houver bloqueio entre as partes.

Trigger pós-insert: atualiza `conversations.last_message_at` e `last_message_preview`.

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE messages, conversations, typing_status, user_presence;`

Storage: novo bucket privado `chat-media` com policies que permitem upload/leitura apenas aos participantes da conversa (path = `{conversation_id}/{uuid}`).

## Server functions (TanStack `createServerFn`)

Arquivo `src/lib/chat.functions.ts`, todos com `requireSupabaseAuth`:

- `startConversation({ atletaId })` — valida papel (admin/clube), verificação, bloqueio, cria/retorna conversa.
- `sendMessage({ conversationId, kind, content?, mediaPath? })` — valida participação + rate limit (defesa em profundidade além do trigger).
- `listConversations()` — lista do usuário com último preview, contagem de não lidas, dados do outro participante.
- `listMessages({ conversationId, before?, limit })` — paginação cursor.
- `markRead({ conversationId })`.
- `searchUsers({ q })` — apenas olheiros/clubes podem buscar atletas; atletas só veem suas conversas existentes.
- `blockUser({ userId })` / `unblockUser({ userId })`.
- `reportUser({ userId, conversationId?, motivo })`.
- `heartbeatPresence()` — chamado a cada ~30s pelo cliente ativo.
- `inviteToPeneira({ conversationId, peneiraId })` — envia mensagem `kind='text'` com payload estruturado (link interno).

## Frontend

Nova rota `/_authenticated/chat` (e `/_authenticated/chat/$conversationId`) com layout próprio dentro do `AppLayout`:

- **Sidebar de conversas** (esquerda em desktop, full-screen em mobile): busca, lista ordenada por `last_message_at`, badge de não lidas, status online.
- **Área de chat**:
  - Header com avatar, nome, status (online/último acesso), menu (bloquear, denunciar, ver perfil, **Convidar para peneira**).
  - Lista de mensagens com agrupamento por data, bolhas estilo WhatsApp, ticks de entregue/visto.
  - Composer com texto, upload de imagem/vídeo/arquivo, indicador "digitando…" via Realtime broadcast.
- **Botão "Nova conversa"** visível só para `admin`/`clube`. Modal com busca de atletas → `startConversation`.
- Item de menu **"Chat"** adicionado ao `AppLayout` para todos os papéis (atleta vê só caixa de entrada).
- Notificações: toast (`sonner`) ao chegar mensagem fora da conversa aberta; título da aba com contador.
- Hooks: `useConversations`, `useMessages(conversationId)`, `usePresence(userId)`, `useTyping(conversationId)` baseados em React Query + canais Supabase Realtime.

## Design

- Reaproveita tokens já existentes (`bg-bg2`, `bg-bg3`, `border-border`, `text-primary` dourado). Tema escuro já é padrão do app — nada de cores hardcoded.
- Bolhas: enviado = `bg-primary/15` com borda dourada sutil; recebido = `bg-bg3`. Radius `rounded-2xl`, sombras suaves.
- Animações: framer-motion para entrada de mensagens e modal de nova conversa.
- Mobile-first: sidebar vira drawer; composer fixo no rodapé com `safe-area`.

## Segurança / limites

- Rate limit no trigger (30 msg/60s) + limite de 20 novas conversas/dia por iniciador.
- Validação Zod em todos os `inputValidator`.
- Tamanho máximo de upload: 20 MB (imagem/vídeo/arquivo) verificado no client e via policy de bucket.
- Bloqueio mútuo impede envio nos dois sentidos.

## Entregáveis em ordem

1. Migration SQL (tabelas, RLS, triggers, bucket, publicação Realtime).
2. `src/lib/chat.functions.ts` + helpers de upload.
3. Hooks de Realtime e presença.
4. Rotas `/chat` e `/chat/$conversationId` + componentes (`ConversationList`, `MessageThread`, `MessageComposer`, `NewConversationDialog`, `ChatHeader`).
5. Entrada "Chat" no `AppLayout` para todos os papéis.
6. Botão "Convidar para peneira" integrado a `peneiras`.
7. QA: testar como atleta (não vê "Nova conversa"), olheiro e clube (podem iniciar), bloqueio, denúncia, rate limit.

## Fora do escopo (a confirmar se necessário)

- Chamadas de voz/vídeo.
- Mensagens de voz (áudio gravado).
- E2E encryption.
- Push notifications nativas (web push pode ser adicionado depois).
