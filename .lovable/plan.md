## Objetivo

1. Permitir envio de **qualquer formato de imagem e vídeo** no chat (incluindo HEIC, AVIF, MKV, MOV, AVI, etc.).
2. Corrigir o bug em que o atleta vê o nome do olheiro/clube como **"Usuário"** em vez do nome real.

---

## 1. Suporte completo a mídias

**Problema atual:** O composer já usa `accept="image/*"` e `accept="video/*"`, o que tecnicamente cobre todos os formatos, mas o bucket `chat-media` pode rejeitar mimes não-padrão, e o `ChatMedia` só renderiza inline `<img>`/`<video>` (formatos como HEIC ou MKV ficam quebrados sem fallback).

**Mudanças:**

- **`src/lib/chat.ts` → `uploadChatMedia`**: detectar mime corretamente quando `file.type` vier vazio (caso comum com HEIC/AVI no navegador) usando a extensão como fallback. Manter o limite de 20 MB.
- **`src/components/chat/ChatMedia.tsx`**:
  - Manter preview inline quando o browser suportar o mime (jpg/png/webp/gif/avif e mp4/webm/ogg).
  - Para formatos não-previsualizáveis (HEIC, TIFF, MKV, MOV, AVI, FLV, etc.), exibir um card de mídia com ícone, nome do arquivo, mime e botão **"Abrir / Baixar"** usando a URL assinada — assim o upload e o compartilhamento funcionam mesmo sem preview nativo.
- **Bucket `chat-media`**: o bucket já é privado sem restrição de mime (verifiquei a configuração atual), então nenhuma migração é necessária.

## 2. Corrigir nome do remetente exibido como "Usuário"

**Causa raiz:** A RLS atual da tabela `profiles` só permite que cada usuário leia o **próprio** perfil (`auth.uid() = id`) ou que admins/suporte leiam todos. Quando o atleta abre uma conversa iniciada por um olheiro (`admin`) ou clube, o `SELECT` em `profiles` para buscar nome/avatar do peer retorna vazio → o código cai no fallback `"Usuário"`.

**Solução:** adicionar uma política de leitura em `profiles` que permita a um usuário ler o perfil de **qualquer pessoa com quem ele compartilhe uma conversa** (já existe a função `is_conversation_participant` e podemos cruzar via `conversations`).

**Migração SQL (uma policy nova, sem alterar as existentes):**

```sql
CREATE POLICY "chat peer profile read"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.iniciador_id = auth.uid() AND c.atleta_id = profiles.id)
       OR (c.atleta_id    = auth.uid() AND c.iniciador_id = profiles.id)
  )
);
```

Isso resolve nos dois sentidos: atleta vê o nome do olheiro/clube, e olheiro/clube continua vendo o nome do atleta. Nenhum dado adicional é exposto além de `nome`, `email`, `avatar_url` para usuários que já estão em conversa direta.

**Bônus:** o `NewConversationDialog` (olheiros/clubes buscando atletas) já depende de `searchAtletas`, que filtra por role e usa o SELECT em `profiles`. Como olheiros e clubes precisam descobrir atletas antes de iniciar conversa, vou também adicionar uma policy permitindo que `admin`/`clube` leiam perfis de atletas (necessário para a busca funcionar de forma consistente — caso contrário só funciona pela query atual por causa do RLS bypass via service role, o que não é o caso aqui).

```sql
CREATE POLICY "scouts read atleta profiles"
ON public.profiles
FOR SELECT
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'clube'))
  AND public.has_role(profiles.id, 'atleta')
);
```

---

## Arquivos afetados

- **Migração nova** (2 policies em `profiles`)
- `src/lib/chat.ts` — fallback de mime no upload
- `src/components/chat/ChatMedia.tsx` — renderização robusta para formatos não-previsualizáveis

Sem alterações em outras partes da plataforma.