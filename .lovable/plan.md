## Objetivo

Permitir que admin e clube acessem o perfil público do atleta (`/atletas/$atletaId`) a partir de três pontos da plataforma.

## 1. No chat — clicar no atleta abre o perfil

Em `src/routes/chat.tsx`:
- Na **lista de conversas** (sidebar), envolver o avatar/nome do peer com um link para `/atletas/$atletaId` quando o usuário logado for `admin` ou `clube` (o peer é sempre o atleta nesse caso). Manter o clique no restante do item para abrir a conversa.
- No **header da conversa ativa** (`ActiveConversation`), tornar o avatar + nome do atleta clicáveis (link para o perfil) quando o usuário for admin/clube. Adicionar também um item “Ver perfil do atleta” no `DropdownMenu` (três pontos) — funciona como menu de contexto acessível, sem depender de botão direito.
- Adicional: habilitar **menu de contexto nativo** (`onContextMenu`) no item da lista e no header que navega para o perfil — atende ao “botão direito” pedido pelo usuário, mas sem quebrar mobile (que continua usando o link/menu).

## 2. Na área de jogadores

Verificar quais rotas já listam atletas para admin/clube (provavelmente `src/routes/candidatos.index.tsx` e/ou uma listagem de atletas). Em cada card/linha de atleta:
- Tornar nome/avatar um `<Link to="/atletas/$atletaId" params={{ atletaId: c.user_id }}>`.
- Manter ações existentes (avaliar, desbloquear contato, etc.) intactas.

Se o item da lista referencia `candidato` (não atleta direto), usar `candidato.user_id` como `atletaId` — pular o link quando `user_id` for nulo (inscrição manual sem conta).

## 3. Inscritos da peneira

Em `src/routes/peneiras.$peneiraId.tsx`:
- Se admin/clube, mostrar a lista de inscritos (`candidatos` da peneira) já existente ou adicionar uma seção “Inscritos”. Cada inscrito vira link para `/atletas/$atletaId` (via `user_id`), seguindo o mesmo padrão acima.
- Reaproveitar a query existente de candidatos da peneira; caso não exista, criar consulta simples filtrada por `peneira_id` respeitando RLS (admin já tem acesso total; clube terá acesso aos campos públicos do perfil via política `scouts read atleta profiles`).

## Sem mudanças de backend

- A política RLS `scouts read atleta profiles` já permite que admin/clube leiam perfis de atletas.
- A rota `/atletas/$atletaId` já existe e exibe vídeos + dados.
- Não há migrações nem novos endpoints.

## Arquivos a editar

- `src/routes/chat.tsx` (link + onContextMenu + item no dropdown)
- `src/routes/candidatos.index.tsx` (link nos cards) — confirmar caminho ao explorar
- `src/routes/peneiras.$peneiraId.tsx` (links nos inscritos, talvez nova seção quando admin/clube)

Sem alterações em componentes compartilhados ou no schema.