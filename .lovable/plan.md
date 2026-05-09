## Objetivo

Tornar o formulário de "Criar peneira" (`src/routes/peneiras.criar.tsx`) mais claro e acessível em dois cards:

1. **Informações básicas** — campo Estado vira `Select` com todas as 27 unidades federativas (incluindo DF).
2. **Programação** — substituir os inputs nativos `time` / `datetime-local` / `number` por seletores roláveis acessíveis e padronizados em 24h.

## Mudanças

### 1. Card "Informações básicas" — Estado

Trocar o `Input` de Estado por um `Select` (shadcn) com as 27 UFs. Lista completa em ordem alfabética: AC, AL, AM, AP, BA, CE, **DF**, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO. Cada item mostra "UF — Nome do estado" para clareza, com o valor sendo a sigla. Inclui label, foco visível, navegação por teclado e leitura por screen reader (já garantidos pelo Radix Select usado pelo shadcn).

### 2. Card "Programação" — seletores roláveis 24h

Criar um componente reutilizável `ScrollPicker` (lista vertical rolável com snap, foco por teclado ↑/↓, role="listbox" e items com `aria-selected`) e usá-lo dentro de `Popover` para os campos abaixo. Trigger é um `Button` mostrando o valor atual + ícone (Clock / Hash). Sempre formato 24h.

Campos afetados:

- **Limite para inscrição** — Popover com:
  - Calendário (shadcn `Calendar`) para a data
  - Dois `ScrollPicker` lado a lado: horas (00–23) e minutos (00–59, passo 5)
  - Valor armazenado continua no formato `YYYY-MM-DDTHH:mm` para compatibilidade com a validação existente.
- **Início (campo disponível)** — Popover com `ScrollPicker` de horas (00–23) e minutos (00–59, passo 5). Valor `HH:mm`.
- **Fim (campo disponível)** — idem.
- **Duração de cada jogo (min)** — Popover com `ScrollPicker` único de 5 a 120 (passo 5).
- **Participantes por jogo** — Popover com `ScrollPicker` único de 2 a 30.

### Acessibilidade do `ScrollPicker`

- `role="listbox"`, `aria-label` descritivo (ex.: "Hora", "Minuto", "Duração em minutos").
- Cada opção é `role="option"` com `aria-selected` e `tabIndex={-1}`.
- Container com `tabIndex={0}`; teclas ↑/↓ movem seleção, Home/End vão a extremos, Enter/Espaço confirmam, e o item ativo é centralizado via `scrollIntoView({ block: "center" })`.
- Snap CSS (`snap-y snap-mandatory`) para a sensação rolável; altura fixa (~ 200px) com indicador da linha selecionada no centro.
- Contraste forte no item selecionado (token `--primary`) e foco visível pelo design system.

### Itens fora do escopo

- Card "Visibilidade" e painel lateral de cálculo permanecem inalterados.
- Lógica de cálculo (`calcularJogos`, `calcularVagas`) e validação não mudam — apenas a UI dos campos.
- Nenhuma alteração de schema/backend.

## Detalhes técnicos

- Novo arquivo: `src/components/ScrollPicker.tsx` exportando `ScrollPicker` e helper `range(start, end, step)`.
- Novo arquivo: `src/lib/br-states.ts` com a constante `BR_STATES` (27 entradas `{ uf, nome }`).
- Edições em `src/routes/peneiras.criar.tsx`: imports, substituição dos campos descritos, manter estado e `update()` exatamente como hoje (strings `HH:mm`, `YYYY-MM-DD`, números).
- Componentes shadcn já existentes: `Select`, `Popover`, `Calendar`, `Button`, `Label`. Verificar presença em `src/components/ui/` antes de implementar; instalar via padrão do projeto se faltar algum.