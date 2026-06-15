# Aplicar estilo "vitrine" no perfil de edição e na visualização do olheiro

## 1. `/perfil` (Meu perfil — edição)

Aplicar o mesmo tema dark + azul neon da página `/perfil-atleta`:

- Fundo geral com gradiente radial escuro (`#0d1e3d → #050b1e`).
- Cards de seção (Dados básicos, Físico, Bio, Estatísticas, Histórico de clubes) com a mesma casca:
  - `border-[#3da9fc]/15`, `bg-[#0a1428]/80`, `backdrop-blur`, `rounded-3xl`, `shadow-[0_30px_80px_-30px_rgba(61,169,252,0.35)]`.
  - Títulos em caps com tracking largo, cor `#7cc6ff`, linha curta gradiente azul abaixo.
- Inputs/Textarea/Select com fundo `#0a1428`, borda `#3da9fc/20`, foco com glow azul; texto branco; labels em `#7cc6ff/80`.
- Botões primários em gradiente azul (`#1a5fb4 → #3da9fc → #7cc6ff`) com glow; secundários outline azul.
- Chip de header "Editar perfil" no mesmo estilo da vitrine + botão "Ver vitrine" linkando para `/perfil-atleta` (somente atleta).
- **Lógica preservada**: nenhum campo, validação ou fluxo de salvar muda — só visual.

## 2. `/atletas/$atletaId` (visualização do olheiro/clube)

Reescrever para usar o mesmo layout da vitrine `/perfil-atleta`:

- Mesma estrutura: header chip + voltar; coluna esquerda com avatar/anel/glow + nome + posição + quick stats (idade/altura/peso/pé); coluna direita com "Sobre mim" + "Habilidades" (barras animadas derivadas de `stats`); embaixo "Vídeo em destaque" + "Conquistas".
- **Diferenças específicas do olheiro**:
  - Botão **"Iniciar conversa"** em destaque no header (gradiente azul + glow), visível para `admin`/`clube` quando `user.id !== atletaId`. Mantém `startConversation` + redirect para `/chat`.
  - `AthleteVideoGallery` com `canManage={user.id === atletaId && user.role === "atleta"}` (apenas o dono gerencia).
  - Botão "Editar dados" não aparece (só para o dono na `/perfil-atleta`).
- Manter `head()` SEO atual (title, description, OG, canonical, JSON-LD ProfilePage).
- Manter fetch atual por `atletaId`, tratamento de "não encontrado" e loading.

## Arquivos

- `src/routes/perfil.tsx` — reskin visual (sem mudar lógica/formulário).
- `src/routes/atletas.$atletaId.tsx` — reescrever JSX no padrão vitrine; preservar SEO, fetch, chat.

## Fora do escopo

- Sem mudanças em backend, schema, rotas ou sidebar.
- Sem alteração em `/perfil-atleta` (já está pronto).
- Sem alteração em `AthleteVideoGallery` ou demais componentes compartilhados.
