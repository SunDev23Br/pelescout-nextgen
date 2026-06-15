# Redesign do Perfil do Atleta

Vou reconstruir a página `/perfil-atleta` para espelhar o mockup enviado: um dashboard escuro, em duas colunas, com identidade "PELEIRA NEXT".

## Layout

```text
┌──────────────────────────────────────────────────────────┐
│ COLUNA ESQUERDA (avatar+nome+stats)  │ COLUNA DIREITA   │
│  ┌─────────────────────────────┐     │ SOBRE MIM         │
│  │   Avatar circular           │     │ ─────────────     │
│  │   (anel azul + glow)        │     │ HABILIDADES       │
│  └─────────────────────────────┘     │  Marcação ▓▓▓▓░   │
│   IGOR SANTOS                        │  Força    ▓▓▓░░   │
│   Volante                            │  Passe    ▓▓▓▓▓   │
│  ┌─────┬─────┬─────┬─────┐           │  Velocidade...    │
│  │17AN │1,79 │72KG │DESTRO│          │  Posicionamento.. │
│  └─────┴─────┴─────┴─────┘           │                   │
├──────────────────────────────────────┴───────────────────┤
│ VÍDEO EM DESTAQUE (player grande)  │ CONQUISTAS (cards)  │
└──────────────────────────────────────────────────────────┘
```

## Mudanças visuais

- Fundo geral mais escuro (`#0a1428` / `#0d1830`) — sem orbs/glow exagerados do hero atual.
- Avatar circular grande centralizado na coluna esquerda, com anel azul neon duplo e brilho radial atrás.
- Nome em display bold uppercase, posição abaixo em cinza-claro.
- Quick stats em linha única de 4 mini-cards horizontais (IDADE / ALTURA / PESO / PÉ), valores grandes em branco, labels em azul claro caps.
- "SOBRE MIM" e "HABILIDADES" empilhados na coluna direita (um único card grande dividido por seção, com títulos em azul neon caps).
- Barras de habilidades finas, fundo escuro, preenchimento gradiente azul com glow; manter animação atual.
- Renomear/expandir skills para combinar com referência: Marcação, Força, Passe, Velocidade, Posicionamento (5 itens, derivados de `stats` com fallback).
- Card "VÍDEO EM DESTAQUE" ocupa ~60% da largura inferior; "CONQUISTAS" ao lado em grid 2 colunas de cards azul-escuro com ícone troféu grande.
- Header superior com chip "Vitrine do atleta" + botão "Editar dados" preservado.

## Arquivos

- `src/routes/perfil-atleta.tsx` — reescrever JSX/estrutura. Lógica de dados (fetch profile, cálculo de skills/conquistas, animação) permanece igual.

## Fora do escopo

- Sem mudanças em `/perfil` (edição).
- Sem mudanças em backend, rotas ou outros componentes.
- Sem alterações em `AthleteVideoGallery` (apenas reposiciono).
