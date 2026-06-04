## Mudanças

### 1. Aba Candidatos — chat para admin e olheiros (clube)
Arquivo: `src/routes/candidatos.index.tsx`

- Manter botão "Chat" apenas para admin e clube (já está assim).
- Para candidatos **sem `userId`** (cadastrados manualmente), o botão "Chat" fica **desabilitado** com tooltip "Candidato sem conta no app".
- Botão "Ver perfil" continua escondido quando não houver `userId` (já implementado).
- Nenhuma mudança de RLS — o chat usa a tabela `conversations` que só aceita atletas com conta.

### 2. Perfil público de olheiro/clube (visível para atletas)
Novo arquivo: `src/routes/usuarios.$userId.tsx` (rota `/usuarios/:userId`)

Mostra para qualquer usuário logado:
- Nome e avatar
- Papel (Olheiro / Clube)
- Nome do clube + CNPJ (quando `role = clube`)
- Email e celular
- Botão "Iniciar conversa" — visível só quando o visitante é olheiro/clube e o alvo é atleta (regra atual do chat). Atleta vendo perfil de olheiro/clube **não** vê esse botão (atletas não podem iniciar conversas pela política do banco).

Acesso à página:
- A partir do chat: clique no nome/avatar do interlocutor na conversa abre `/usuarios/$userId` (já carregamos `peer` via `get_conversation_peers`).
- Edit em `src/routes/chat.tsx` para tornar o cabeçalho da conversa clicável.

RLS:
- Política existente `chat peer profile read` já permite o atleta ler o perfil do olheiro/clube com quem conversa. Sem migração necessária.
- A página exibe "Perfil não disponível" se a query retornar nulo (caso visitante não tenha permissão).

### 3. Remover controles de acessibilidade
- Deletar `src/components/AccessibilityControls.tsx`.
- Em `src/routes/atletas.$atletaId.tsx`: remover imports `AccessibilityControls`, `a11yContainerClass`, `useA11yPrefs`, o estado `prefs`, o `<AccessibilityControls>` renderizado, a classe wrapper a11y, e a prop `showCaptions` passada ao `AthleteVideoGallery`.
- Em `src/components/AthleteVideoGallery.tsx`: remover prop `showCaptions` e qualquer renderização de legendas atrelada a ela (manter o `aria-label` e o vídeo normais).
- Em `src/styles.css`: remover o bloco `.a11y-high-contrast { ... }` no fim do arquivo.

### Resumo de arquivos
- editar: `src/routes/candidatos.index.tsx` (tooltip/disabled), `src/routes/atletas.$atletaId.tsx`, `src/components/AthleteVideoGallery.tsx`, `src/styles.css`, `src/routes/chat.tsx` (link no header da conversa)
- criar: `src/routes/usuarios.$userId.tsx`
- deletar: `src/components/AccessibilityControls.tsx`
- sem migração de banco