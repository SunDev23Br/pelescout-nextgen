## Problema

No card "Perna Dominante & Bilateralidade" (`src/components/evaluation/FootProfile.tsx`), a média atual é calculada em duas etapas:

1. Faz a média de passe, finalização, domínio e drible (bilateral).
2. Faz a média desse resultado com o "uso da perna não dominante".

Isso dá ao "uso da perna não dominante" peso de 50%, enquanto cada um dos outros quatro tem só 12,5%. Não reflete o que o usuário quer.

## Correção

Calcular a média aritmética simples dos **5 parâmetros com peso igual** (cada um 20%):

- Uso da perna não dominante
- Passe
- Finalização
- Domínio
- Drible

Apenas valores preenchidos (>0) entram no cálculo, mantendo o comportamento atual de mostrar "—" quando nenhum foi preenchido.

### Mudança técnica

Em `FootProfile.tsx`, substituir o bloco que calcula `bilateralAvg` + `mediaParts` + `mediaPerna` por:

```ts
const valores = [
  data.usoNaoDominante,
  data.bilateral.passe,
  data.bilateral.finalizacao,
  data.bilateral.dominio,
  data.bilateral.drible,
].filter((v) => v > 0);
const mediaPerna = valores.length
  ? valores.reduce((a, b) => a + b, 0) / valores.length
  : 0;
```

A função `computeFootBonus` (usada em outras partes do score) **não é alterada** — a mudança é apenas na média exibida no badge do card.

## Arquivos

- editar `src/components/evaluation/FootProfile.tsx`
