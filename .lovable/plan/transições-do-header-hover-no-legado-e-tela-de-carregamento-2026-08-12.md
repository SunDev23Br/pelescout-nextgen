# Transições do header, hover no Legado e tela de carregamento

## 1. Rolagem suave entre seções
- Clicar em qualquer item do header (ou do rodapé) passa a rolar suavemente até a seção, em vez do salto instantâneo.
- A rolagem para na altura certa, sem o título ficar escondido sob o header fixo.
- O endereço na barra do navegador é atualizado com a seção (ex.: `#legado`), permitindo compartilhar o link direto.
- Quem tem "reduzir movimento" ativado no sistema continua com o salto direto.

## 2. Animação nas fotos do Legado
- Ao passar o cursor sobre cada foto da linha do tempo: leve zoom da imagem, saturação/contraste voltando ao normal (hoje ficam dessaturadas), sombra suave e um brilho dourado discreto acompanhando o ponteiro.
- O card inteiro do marco acompanha o realce (ponto dourado e ano ganham destaque).
- Sem movimento quando "reduzir movimento" está ativo.

## 3. Tela de carregamento inicial
- Ao entrar no site, aparece uma tela cheia com o logo Pelé Scout e um indicador dourado sutil, cobrindo a montagem dos elementos.
- Ela some com fade assim que a página está pronta (fontes/imagem principal do hero carregadas), com duração mínima curta para não piscar.
- Depois do fade, as animações de entrada da home rodam normalmente.
- Aplica-se ao carregamento da homepage; navegações internas não reexibem a tela.

## Notas técnicas
- `src/routes/index.tsx`: handler de clique nos links de seção usando `scrollIntoView({ behavior: "smooth" })` com offset do header + `history.replaceState` do hash; mesmo handler reaproveitado no footer e no menu mobile.
- Alternativa/complemento: `scroll-behavior: smooth` em `html` no `src/styles.css` com guarda de `prefers-reduced-motion`; `scroll-mt` já existe nas seções.
- `src/components/home/Historia.tsx`: wrapper com `group` + `overflow-hidden` na imagem, `group-hover:scale-[1.06]`, transição de filtro, e brilho via variáveis do hook existente `use-tilt`.
- Novo `src/components/home/PageLoader.tsx` montado na home, controlado por estado local + `document.fonts.ready`/`window.load`, com fade-out e `motion-reduce` respeitado; sem alterações de banco.
