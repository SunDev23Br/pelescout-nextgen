# Header da homepage, azul mais escuro e mais movimento

## 1. Header com opções da própria homepage
- O menu passa a listar apenas âncoras de seções desta página: Legado, Academia, Como funciona, Peneiras, Mapa e Parceiros.
- Links "Peneiras" e "Manual" que levam para outras páginas saem do menu central; permanecem apenas as ações de conta (tema, Entrar, Cadastrar).
- Cada seção da home ganha um `id` e rolagem suave com deslocamento para não ficar escondida sob o header fixo.
- O item correspondente à seção visível fica destacado em dourado enquanto o usuário rola.
- Em telas pequenas, o menu vira uma faixa rolável horizontal com os mesmos atalhos.

## 2. Azul mais escuro nas seções
- As seções "Mais que uma peneira" e "Como funciona" trocam o azul forte pelo azul escuro da página: o gradiente do fundo azul passa a usar apenas os tons escuros já existentes no design system, sem cor nova e sem valores fixos.

## 3. Mais movimento e interatividade
- Entradas escalonadas no estilo do Legado aplicadas às demais seções (itens aparecendo em sequência conforme entram na tela).
- Números e contadores animam ao surgir; barras de vagas preenchem com transição.
- Cards de peneiras, passos do "Como funciona" e itens do Legado respondem ao cursor (inclinação 3D sutil, brilho seguindo o ponteiro, leve zoom na imagem).
- Pontos do mapa com pulso suave e realce ao passar o mouse.
- Efeito de profundidade leve no scroll (parallax discreto) nas imagens do Legado e Academia.
- Tudo desativado quando o sistema pede "reduzir movimento".

## Notas técnicas
- Alterados: `src/routes/index.tsx` (header + ids/scroll spy), `src/styles.css` (gradiente do `surface-blue`), e as seções em `src/components/home/` para ids, reveal escalonado e tilt via `use-tilt`.
- Novo hook leve de scroll spy em `src/hooks/`.
- Sem mudanças de dados ou banco.
