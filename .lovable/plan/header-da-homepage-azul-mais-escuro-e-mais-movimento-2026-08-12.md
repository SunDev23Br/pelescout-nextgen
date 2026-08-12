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

## 4. Footer com os mesmos atalhos do header
- O rodapé passa a repetir a navegação por seções da homepage (Legado, Academia, Como funciona, Peneiras, Mapa, Parceiros), com a mesma rolagem suave.

## 5. Botões padronizados
- Os botões "Cadastrar" (header) e "Encontrar minha peneira" (CTA final) ficam com o mesmo desenho do "Encontrar minha peneira" do hero: pílula dourada, sombra suave, brilho que percorre no hover, leve elevação e seta que desliza.

## 6. Seção "Pelé Scout" (CTA final) mais escura
- O degradê sobre a foto do campo fica mais fechado, usando o azul escuro da página com opacidades maiores, mantendo o texto claro e o dourado em destaque.

## 7. Mapa do Brasil de verdade
- Substitui a projeção por pontos por um mapa vetorial do Brasil com os contornos reais dos estados.
- Estados com peneiras ativas ficam preenchidos em dourado (intensidade conforme a quantidade); os demais ficam neutros.
- Ao passar o cursor: o estado se realça e aparece um cartão com nome do estado, número de peneiras ativas e as próximas datas/cidades; clicar leva à lista filtrada por aquele estado.
- Os dados vêm das peneiras já carregadas do banco, então o mapa se atualiza sozinho conforme novas peneiras são cadastradas.
- A lista lateral de estados continua sincronizada com o realce no mapa.

## 8. Acesso somente com conta
- Qualquer caminho para o sistema a partir da homepage exige conta: "Ver todas as peneiras", "Ver oportunidade", cards de peneiras, o mapa e os botões do hero/CTA levam o visitante sem sessão direto para a tela de login.
- A página de login recebe o destino pretendido e, após entrar (ou criar conta), o usuário é levado exatamente para onde clicou.
- A proteção também vale para quem digita a URL direto: as páginas de peneiras e detalhe da peneira verificam a sessão e redirecionam para o login quando não houver.
- A homepage continua pública, com as informações de vitrine visíveis.

## 9. Cards de peneiras alinhados e responsivos
- Os cards passam a ter altura uniforme, com título, local, categorias, contador de vagas e botão sempre nas mesmas linhas, independentemente do tamanho do texto (títulos com no máximo duas linhas).
- No mobile: uma coluna, imagem em proporção fixa, tipografia e espaçamentos reduzidos, botões de largura total e área de toque confortável.
- Filtros/busca, header, hero, carrossel, mapa e footer revisados nas larguras pequenas para evitar transbordo horizontal e textos apertados.

## Notas técnicas
- Alterados: `src/routes/index.tsx` (header, footer, ids/scroll spy), `src/styles.css` (gradiente do `surface-blue`), `CtaFinal.tsx`, `MapaOportunidades.tsx`, `PeneirasSection.tsx`, `ProximaPeneiraCard.tsx`, `Hero.tsx` e demais seções em `src/components/home/`.
- Guarda de sessão nas rotas `peneiras.index` e `peneiras.$peneiraId`, com `redirect` na URL de login e retorno após autenticar.
- Novo hook leve de scroll spy em `src/hooks/`; novo componente de mapa SVG do Brasil com os paths dos 27 estados em `src/components/home/` (sem dependência externa de mapas).
- Sem mudanças de banco; a contagem por UF continua derivada de `peneiras`.


