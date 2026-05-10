## Objetivo

Tornar o card "Próxima peneira" da home apenas informativo (não clicável).

## Mudança

### `src/routes/index.tsx`

- Remover o `<Link to="/peneiras/$peneiraId" ...>` que envolve o card quando há `proxima`.
- Substituir por uma `<div>` com as mesmas classes visuais, mas sem efeitos de hover de "clique" (manter a borda/visual atual, removendo `hover:border-primary hover:shadow-gold` e `transition-all` que sugerem interação).
- Manter o conteúdo dinâmico (título, cidade/UF, data) já vindo do banco.
- Fallback "Em breve" continua igual.

## Fora do escopo

- Não mexe na lógica de fetch, no banco, nem em outras telas.
