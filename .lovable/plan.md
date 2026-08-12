# Redesign editorial da homepage — Pelé Scout

Reformulação completa da página inicial (`/`) como experiência editorial esportiva, mantendo rotas, dados e funcionalidades existentes. Nenhuma outra tela é alterada.

## Narrativa da página

1. **Hero** — mensagem curta e forte, CTA principal "Encontrar minha peneira" (leva a `/peneiras`) e secundário "Como funciona" (âncora na seção 5). Composição assimétrica: tipografia grande à esquerda, fotografia editorial de campo/atleta ocupando a coluna direita até a borda da tela. Sem blobs, sem glow, sem card flutuante decorativo. Mantém a informação real de "próxima peneira" (já buscada do banco), mas como legenda discreta sobre a foto, não como card.
2. **Mais que uma peneira** — bloco editorial assimétrico: eyebrow "MAIS QUE UMA PENEIRA", título "O sonho começa antes do primeiro jogo.", parágrafo curto, fotografia grande sangrando para fora do grid. Muito espaço negativo.
3. **História da Pelé Academia** — timeline horizontal no desktop / vertical no mobile: 1969 → Desenvolvimento → Expansão → Presente. Cada marco: ano em número grande, título, descrição de 1–2 linhas e foto. Revelação progressiva no scroll.
4. **Dentro da Academia** — composição fotográfica em grid editorial irregular (proporções e alturas diferentes, sobreposição sutil), com as legendas TREINO / SONHO / CAMINHO. Não é galeria nem carrossel.
5. **Como funciona** — quatro etapas (01 ENCONTRE, 02 INSCREVA-SE, 03 PARTICIPE, 04 MOSTRE SEU POTENCIAL) construídas só com números grandes, linhas finas e tipografia. Sem cards.
6. **Peneiras disponíveis** — "Encontre sua próxima oportunidade": lista real do banco (mesma fonte de dados de `/peneiras`) com filtros de estado, cidade/busca, categoria (faixa etária) e data. Cards objetivos mostrando onde, quando, faixa etária, organizador e vagas, com CTA "Ver oportunidade". Link "Ver todas as peneiras" para `/peneiras`.
7. **Mapa de oportunidades** — mapa do Brasil em SVG minimalista (traço fino, sem cores de dashboard) com pontos nos estados que têm peneiras, contagem por estado e um resumo lateral com os estados mais ativos. Dados reais das peneiras carregadas.
8. **Clubes e parceiros** — faixa institucional discreta com poucos logos em monocromático, não uma parede de marcas.
9. **CTA final** — "Seu próximo capítulo começa aqui.", texto curto e CTA "Encontrar minha peneira" sobre fotografia de campo com tratamento escuro.
10. **Rodapé** — mantido, com ajuste tipográfico ao novo ritmo.

## Direção de arte

- Paleta e tokens atuais preservados (dourado + azul, claro/escuro). Sem novos gradientes; dourado usado como acento em linhas, eyebrows e números, não em fundos.
- Tipografia: Poppins em pesos extremos para títulos (tamanhos bem maiores que hoje), Inter em corpo, microtipografia em maiúsculas com tracking largo para etiquetas.
- Grid editorial de 12 colunas com quebras assimétricas, linhas de 1px como separadores de seção, bastante espaço negativo entre blocos.
- Fotografia com tratamento consistente (mesmo contraste/temperatura, leve dessaturação) para parecer uma só campanha.

## Fotografia

Não há fotos da Pelé Academia no projeto (só os logos). Vou usar um conjunto curado e consistente de imagens esportivas realistas (treino, chuteiras, campo, treinador orientando, grupo, avaliação) tratadas com o mesmo filtro. Se você enviar fotos reais da Academia, substituo diretamente — os arquivos ficarão isolados para troca fácil.

## Animações

Somente: fade/rise no scroll com IntersectionObserver, parallax muito sutil nas imagens do hero e do CTA final, revelação sequencial dos marcos da timeline, e microinterações em botões e cards. Respeita `prefers-reduced-motion`.

## Responsivo

Mobile reorganiza a composição em vez de empilhar tudo: hero com foto full-bleed e texto sobreposto, timeline vertical com trilho à esquerda, composição fotográfica reduzida a 2 colunas com proporções mantidas, filtros de peneiras em linha rolável, CTAs com área de toque confortável.

## Detalhes técnicos

- `src/routes/index.tsx` reescrito como orquestrador; seções em componentes novos sob `src/components/home/` (Hero, MaisQueUmaPeneira, Timeline, DentroDaAcademia, ComoFunciona, PeneirasSection, MapaOportunidades, Parceiros, CtaFinal).
- Dados: reutiliza `fetchPeneirasFromDb()` e os tipos de `src/lib/mock-data`; nenhuma mudança de schema, RLS ou server function.
- Filtros da seção 6 em estado local com `useMemo`, mesma lógica de busca já usada em `/peneiras`.
- Mapa: SVG do Brasil inline com coordenadas por UF (reaproveita `UF_COORDS` de `src/lib/geo.ts`).
- Novo hook `useReveal` para animações de scroll; `useCountUp` existente mantido onde houver números.
- Tokens extras (linhas finas, tratamento de imagem) adicionados em `src/styles.css`; nenhuma cor hardcoded.
- `head()` da rota mantém e refina título, descrição, OG e JSON-LD.
