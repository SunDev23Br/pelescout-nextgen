## Objetivo

No card "Próxima peneira" da home (`src/routes/index.tsx`), substituir o texto fixo ("Sub-17 · Santos/SP · 18 mai") pelos dados da peneira mais próxima registrada no banco, e transformar o card em um link que leva para a página de detalhe dessa peneira.

## Mudanças

### `src/routes/index.tsx`

- Converter `Landing` para buscar peneiras via `fetchPeneirasFromDb()` (já existe em `src/lib/peneiras.db.ts`) usando `useEffect` + `useState`.
- Selecionar a "próxima peneira": primeira peneira com `status === "aberta"` ordenada por `data` ascendente (a query do helper já ordena por data). Se não houver, fallback para a primeira da lista; se a lista estiver vazia, esconder o card ou mostrar um placeholder discreto ("Em breve").
- Envolver o card com um `<Link to="/peneiras/$peneiraId" params={{ peneiraId: proxima.id }}>` para navegar ao detalhe.
- Substituir o título e subtítulo pelos campos reais: `proxima.titulo` (ou primeira categoria + cidade) e `formatDate(proxima.data)` no padrão já usado em `PeneiraCard`.

## Fora do escopo

- Não muda layout, cores, ou outros textos da home.
- Não altera `PeneiraCard`, rotas, RLS ou banco.
