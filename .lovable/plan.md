## Objetivo

1. Substituir o campo **Idade** por **Data de nascimento** em todo o sistema (cadastro, perfil, listagens, cards, mocks e banco). A idade passa a ser **calculada automaticamente** a partir da data de nascimento sempre que precisar ser exibida ("17 anos").
2. No cadastro de atleta, trocar os `Input` numéricos de **Altura (cm)** e **Peso (kg)** por **rolagens acessíveis** (componente `ScrollPicker` já existente), em formato semelhante ao usado no fluxo de "Criar peneira".

---

## 1. Banco de dados (migration)

Tabela `candidatos`:
- Adicionar coluna `data_nascimento date` (nullable inicialmente, para backfill).
- Backfill: para registros antigos, definir `data_nascimento = (current_date - (idade || ' years')::interval)::date` quando `idade` existir.
- Tornar `data_nascimento` NOT NULL após backfill.
- Manter a coluna `idade` por enquanto como **coluna gerada** (computed) ou removê-la. Plano: **remover** `idade` para evitar duplicidade e fonte única de verdade ser `data_nascimento`. Toda a UI calcula a idade a partir da data.

> Como `idade` aparece em queries do front, todas as referências serão atualizadas no mesmo passo. Sem campo `idade` legado.

---

## 2. Utilitário novo

`src/lib/date.ts`:
- `calcularIdade(dataNascimento: string | Date): number` — calcula anos completos até hoje.
- `formatarDataBR(data: string | Date): string` — formato `dd/mm/aaaa`.
- `dataNascimentoMin/Max` para validar (ex.: 8 a 40 anos).

---

## 3. Tipos e mock

`src/lib/mock-data.ts`:
- Trocar `idade: number` por `dataNascimento: string` (ISO `YYYY-MM-DD`) em `Candidato`.
- Atualizar `mockCandidatos` para gerar `dataNascimento` a partir da idade atual (preservando os anos atuais).
- Onde a UI lê `c.idade`, passar a usar `calcularIdade(c.dataNascimento)`.

Arquivos afetados:
- `src/components/evaluation/EvaluationCard.tsx` (prop `idade` continua, mas o consumidor passa `calcularIdade(...)`).
- `src/routes/candidatos.index.tsx`, `src/routes/candidatos.$candidatoId.tsx`
- `src/routes/clubes.tsx`, `src/routes/avaliacoes.tsx`
- `src/routes/peneiras.$peneiraId.tsx`, `src/routes/peneiras.index.tsx`, `src/routes/dashboard.tsx` (se exibirem idade)

---

## 4. Cadastro de atleta (`src/routes/cadastro.tsx`)

- Remover campo **Idade**.
- Adicionar campo **Data de nascimento**: usar `Popover` + `Calendar` (shadcn) com locale pt-BR, intervalo permitido entre 40 e 8 anos atrás, exibindo `dd/mm/aaaa` no botão.
- Validar com Zod: `dataNascimento: z.string().refine(...)` calculando idade entre 8 e 40.
- Substituir `Input` de **Altura (cm)** por `Popover` + `ScrollPicker` (range 120–230, passo 1, formato `"178 cm"`).
- Substituir `Input` de **Peso (kg)** por `Popover` + `ScrollPicker` (range 25–150, passo 1, formato `"68 kg"`).
- Ao submeter, gravar em `candidatos` o campo `data_nascimento` (e não mais `idade`).

Componentes auxiliares no mesmo arquivo (ou em `src/components/`):
- `HeightPicker`, `WeightPicker`, `BirthDatePicker` — wrappers finos sobre `ScrollPicker`/`Calendar` com `aria-label` descritivo.

---

## 5. Exibição em listas e cards

Substituir todas as ocorrências de `${algo.idade} anos` por `${calcularIdade(algo.dataNascimento)} anos`:
- `candidatos.index.tsx` (linhas 140, 215)
- `candidatos.$candidatoId.tsx` (linha 86) — adicionar também bloco "Data de nascimento" na ficha.
- `clubes.tsx` (linha 160)
- `avaliacoes.tsx` (linhas 261, 288)

`EvaluationCard` mantém a prop `idade` (já é só uma `number`); chamadores passam o valor calculado.

---

## 6. Perfil (`src/routes/perfil.tsx`)

Atualmente `perfil.tsx` não edita idade — apenas nome, e-mail, avatar e senha. **Sem mudanças** necessárias, a não ser que o usuário queira editar data de nascimento depois (fora deste escopo, salvo pedido contrário).

---

## Fora de escopo

- Tabela `profiles` (não tem idade hoje).
- Schema/UI de "Criar peneira" (mexido na rodada anterior, não tem campo de idade).
- Edição da data de nascimento na tela de Perfil (pode ser pedido em seguida).

---

## Resumo de arquivos

Criados:
- `src/lib/date.ts`

Editados:
- `src/lib/mock-data.ts`
- `src/routes/cadastro.tsx`
- `src/routes/candidatos.index.tsx`
- `src/routes/candidatos.$candidatoId.tsx`
- `src/routes/clubes.tsx`
- `src/routes/avaliacoes.tsx`

Migration: adiciona `data_nascimento` em `candidatos`, faz backfill, remove `idade`.