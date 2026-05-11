## Objetivo
Adicionar um seletor de **Categorias** (Sub-11, Sub-13, Sub-15, Sub-17, Sub-20, Profissional, etc.) no formulário de criação de peneiras, com botões acessíveis (toggle), e persistir os valores no banco para que apareçam em toda peneira criada por admin/clube.

## O que já existe
- A tabela `peneiras` já possui a coluna `categorias TEXT[]` (default `{}`).
- A leitura em `peneiras.db.ts` já mapeia `categorias`.
- Falta apenas: UI no formulário + envio no `criarPeneira`.

Nenhuma migração de banco é necessária.

## Mudanças

### 1. `src/routes/peneiras.criar.tsx`
- Adicionar `categorias: [] as string[]` no estado `form`.
- Criar uma constante `CATEGORIAS = ["Sub-11","Sub-13","Sub-15","Sub-17","Sub-20","Profissional"]`.
- Novo `<Card title="Categorias">` (logo após "Informações básicas") com um grupo de botões toggle:
  - Cada categoria é um `<button type="button" role="checkbox" aria-checked={...}>` (acessível, navegável por teclado, com foco visível usando tokens do design system).
  - Selecionado: borda dourada `border-primary bg-primary/10`. Não selecionado: `border-border bg-bg2`.
  - Inclui texto auxiliar explicativo (`aria-describedby`) e `<fieldset>/<legend>` semânticos.
- Validação leve: se nenhuma categoria selecionada, mostra erro inline ("Selecione ao menos uma categoria") e impede submit.
- Passa `categorias: form.categorias` para `criarPeneira(...)`.

### 2. `src/lib/peneiras.functions.ts`
- Adicionar `categorias: string[]` em `CriarPeneiraInput`.
- Incluir `categorias: input.categorias` no objeto `insert`.

### 3. Exibição (já funciona)
A página de detalhes / lista lê `categorias` do banco — assim que persistido, aparece para todos os usuários (admin, clubes, atletas, suporte) automaticamente em qualquer login.

## Acessibilidade
- `<fieldset>` + `<legend>` para o grupo.
- Botões com `role="checkbox"`, `aria-checked`, `aria-label`, e suporte a `Space`/`Enter`.
- Foco visível via `focus-visible:ring-2 ring-ring`.
- Contraste suficiente nos estados ativo/inativo (tokens semânticos).

## Fora do escopo
- Não altera schema do banco.
- Não muda outras telas (lista, detalhes) — já consomem `categorias`.