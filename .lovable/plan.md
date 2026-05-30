## Objetivos

1. Criar **perfil personalizado do atleta** com upload e player de vídeos em qualquer formato, abertos dentro da plataforma.
2. Corrigir o chat ainda mostrando o olheiro/clube como **"Usuário"** para o atleta.
3. Permitir abrir o **vídeo do chat em tela ampliada inline** (sem sair da página).

---

## 1. Perfil do atleta com vídeos

### Banco (migração)

- Nova tabela `public.athlete_videos`:
  - `id`, `atleta_id` (uuid, FK lógico para `profiles.id`), `path` (text, no bucket), `mime` (text), `size` (int), `titulo` (text), `created_at`.
- GRANTs para `authenticated`/`service_role`; RLS:
  - **SELECT**: o próprio atleta, qualquer `admin`/`clube`, e qualquer usuário que compartilhe uma conversa com o atleta.
  - **INSERT/DELETE**: apenas o próprio atleta (`auth.uid() = atleta_id` e role `atleta`).
- Novo **bucket privado `athlete-videos`** (sem restrição de mime, limite 100 MB por arquivo via app):
  - Policies de storage: upload/delete só pelo dono (`(storage.foldername(name))[1] = auth.uid()`); SELECT via URL assinada gerada no servidor → liberar SELECT para `authenticated` (URLs assinadas já protegem por tempo).

### Frontend

- **`src/routes/perfil.tsx`** (apenas para `atleta`): adicionar uma seção "Meus vídeos":
  - Lista em grid com thumbnail/placeholder, título, botão remover.
  - Botão "Enviar vídeo" (input `accept="video/*"`, qualquer formato, 100 MB max).
  - Player inline (modal Dialog) reutilizando o padrão de `ChatMedia` — abre na própria página.
- **`src/routes/atletas.$atletaId.tsx`** (nova rota pública para olheiros/clubes e o próprio atleta):
  - Mostra dados do perfil (nome, posição, cidade, idade, altura, peso, pé) + galeria de vídeos com player inline.
  - Botão "Iniciar conversa" (só visível para `admin`/`clube`).
- Reutilizar a lógica de URL assinada de `src/lib/chat.ts` em um helper genérico `getSignedUrl(bucket, path)` em `src/lib/storage.ts` para servir o bucket `athlete-videos`.
- Suporte universal de formatos: mesma estratégia de `ChatMedia` — se o navegador não suportar (MKV, MOV exótico, AVI), mostrar card com download/abrir em nova aba; formatos comuns (mp4, webm, mov padrão) tocam inline.

### Navegação

- Link "Ver perfil" no card do candidato (apenas para `admin`/`clube`) e no avatar do atleta dentro do chat.

---

## 2. Corrigir nome do peer ("Usuário") no chat

A policy `chat peer profile read` já existe, mas o `SELECT` em `profiles` está intermitente porque depende de uma subquery em `conversations` que, dependendo do plano do PostgREST, pode retornar vazio antes do realtime atualizar o cache.

**Solução robusta:** trocar o `select` direto por uma **função RPC SECURITY DEFINER** `public.get_conversation_peers(_conv_ids uuid[])` que retorna `(conversation_id, peer_id, nome, avatar_url)` apenas para conversas em que `auth.uid()` participa. Isso elimina o problema de RLS na join e é mais rápido.

- Migração: criar a função.
- `src/lib/chat.ts` → `listConversations`: substituir a consulta a `profiles` pela RPC nova; manter fallback `"Usuário"` apenas se a RPC falhar.

---

## 3. Vídeo do chat em tela ampliada inline

Hoje `ChatMedia` toca vídeos pequenos dentro da bolha de mensagem, sem botão de expandir. Mudanças em **`src/components/chat/ChatMedia.tsx`**:

- Para `kind === "video"` previsualizável: além do `<video>` inline, adicionar um botão "Expandir" sobre o player que abre o mesmo `MediaLightbox` já usado para imagens — vídeo em tela grande, ainda dentro da página do chat.
- Garantir `playsInline`, `controls`, `preload="metadata"` nos dois (bolha e lightbox).
- Para vídeos não-previsualizáveis pelo browser, manter o card e abrir lightbox com mensagem clara + botão "Baixar".

---

## Arquivos afetados

- Migração nova: tabela `athlete_videos` + policies, bucket `athlete-videos` + policies, função RPC `get_conversation_peers`.
- `src/lib/storage.ts` (novo) — helper genérico de signed URL.
- `src/lib/chat.ts` — usar RPC nova para nomes dos peers.
- `src/lib/athlete-videos.ts` (novo) — CRUD de vídeos do atleta.
- `src/components/chat/ChatMedia.tsx` — botão expandir para vídeo.
- `src/routes/perfil.tsx` — seção "Meus vídeos".
- `src/routes/atletas.$atletaId.tsx` (novo) — perfil público do atleta com galeria.
- Link "Ver perfil" no card do atleta no chat / candidatos.

Sem alterações no restante da plataforma.
