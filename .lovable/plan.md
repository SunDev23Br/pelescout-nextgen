# Padronizar tamanho dos cards de peneira

Hoje os cards em `/peneiras` têm alturas diferentes porque alguns elementos variam: título com 1 ou 2 linhas, lista de categorias opcional (com 0, 1 ou várias linhas que quebram) e meta-info que pode ter textos mais longos. O `Button` no final usa `mt-auto`, então a diferença sobra no meio do card.

## Mudanças (somente em `src/components/PeneiraCard.tsx`)

1. **Título**: reservar sempre 2 linhas, mesmo quando o título tem só 1 linha — usar `min-h` equivalente a 2 linhas de `text-lg leading-tight` para travar a altura.
2. **Bloco de categorias**: sempre renderizar o container (mesmo vazio) com altura fixa de uma linha de chips, com `overflow-hidden` para não estourar quando houver muitas categorias. Limitar visualmente a 1 linha (ex.: `max-h` + `overflow-hidden`) ou mostrar no máximo N categorias e o restante como `+X`.
3. **Imagem**: já é `h-44`, manter.
4. **Card raiz**: garantir altura uniforme via grid (o grid já está em `peneiras.index.tsx` com `sm:grid-cols-2 xl:grid-cols-3` — itens do grid esticam por padrão, então basta o card interno usar `h-full` para preencher a célula). Adicionar `h-full` no `<article>`.

## Resultado

Todos os cards no grid terão exatamente a mesma altura, independente do tamanho do título ou da quantidade de categorias. Sem mudanças em dados, rotas ou estilos globais.
