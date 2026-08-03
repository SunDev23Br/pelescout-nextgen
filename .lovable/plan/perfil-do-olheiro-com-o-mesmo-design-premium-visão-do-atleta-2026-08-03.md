# Perfil do olheiro com o mesmo design premium (visão do atleta)

Hoje, quando o atleta clica no perfil do olheiro (a partir do chat), ele cai em `/usuarios/$userId`, uma tela simples com foto, nome, email e telefone. Quando o olheiro clica no perfil de um atleta, ele vê a vitrine completa (`/atletas/$atletaId`). A ideia é equilibrar: o atleta passa a ver a mesma vitrine premium do olheiro que já existe em "Meu perfil de olheiro".

## O que muda

- Nova página pública do olheiro em `/olheiros/$userId`, com o mesmo layout de `/perfil-olheiro`: header grande com foto, selo "Olheiro verificado", cargo, cidade, contato, nota média, cards de estatísticas, Sobre, Especialidades, Posições observadas, Experiência, Competições, Agenda de peneiras, Disponibilidade e sidebar de resumo.
- Diferença em relação à versão "minha": em vez de "Editar dados", o atleta vê os botões de ação **Enviar vídeo para avaliação** e **Entrar em contato**, que abrem/iniciam a conversa com aquele olheiro no chat.
- `/usuarios/$userId` passa a redirecionar automaticamente para `/olheiros/$userId` quando o usuário visualizado é olheiro/admin (mesma lógica que já existe hoje para atletas). Assim, qualquer link atual no chat continua funcionando e leva à tela nova.
- Se o atleta não tiver conversa com aquele olheiro (sem permissão de visualizar), a página mostra um estado vazio elegante em vez de erro.

## Detalhes técnicos

- Extrair o corpo visual de `src/routes/perfil-olheiro.tsx` para um componente compartilhado `src/components/ScoutProfileView.tsx`, com props `userId`, `variant: "self" | "public"`. `perfil-olheiro.tsx` e a nova rota `src/routes/olheiros.$userId.tsx` passam a renderizar esse componente (sem duplicar layout).
- Regras de acesso: o atleta já consegue ler `profiles` do olheiro pela policy `chat peer profile read`, mas **não** consegue ler `avaliacoes` de outro usuário. Para as estatísticas (atletas observados, avaliações, indicações, aprovados, nota média) será criada uma função security-definer `public.get_olheiro_public_stats(_scout uuid)` que devolve apenas números agregados — sem expor dados de atletas. A função só retorna dados quando o solicitante é admin/suporte ou compartilha conversa com o olheiro.
- Agenda continua vindo de `peneiras` com visibilidade pública (já legível pelo atleta).
- Ações: "Entrar em contato" usa `startConversation(userId)` de `src/lib/chat.ts` e navega para `/chat`; "Enviar vídeo para avaliação" abre a mesma conversa com o composer focado.
- `head()` próprio na nova rota com título/descrição do olheiro e `og:title`/`og:description`.
- Skeleton loading e empty states iguais aos da página atual.

## Fora do escopo

- Não altera a vitrine do atleta nem o design de `/perfil-olheiro` (apenas reaproveita).
- Redes sociais (Instagram/LinkedIn) continuam como links genéricos até existirem campos no cadastro.
