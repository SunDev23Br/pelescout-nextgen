# Homepage: mais orgânica, viva e explicativa

Ajustes sobre o redesign editorial atual, mantendo a identidade (preto/dourado, tipografia display, grid amplo).

## 1. Hero — card da próxima peneira no lugar da foto
- A foto grande do atleta sai da coluna direita e dá lugar ao card da **próxima peneira**, como era antes: data em destaque, título, local/cidade-UF, categorias, contador de vagas (inscritos/vagas), selo de status e botões "Ver oportunidade" / "Ver todas".
- A imagem da própria peneira aparece como fundo do card (com gradiente para leitura), usando o campo de imagem já existente nos dados.
- Estado de carregamento com esqueleto e fallback quando não houver peneira aberta.

## 2. Movimento na abertura e resposta ao cursor
- Animação de entrada ao carregar a página (não só no scroll): eyebrow, título linha a linha, texto, botões e card entram em sequência escalonada.
- Botões e links voltam ao desenho antigo: cantos arredondados, sombra dourada suave, brilho que percorre no hover, leve elevação e escala no clique.
- Cards e imagens ganham resposta ao cursor: inclinação sutil 3D acompanhando o mouse, brilho que segue o ponteiro e zoom leve na imagem.
- Tudo respeita "reduzir movimento" do sistema.

## 3. Peneiras disponíveis com foto
- Cada card da lista passa a exibir a foto da peneira no topo (proporção 16:9, zoom suave no hover), com data e estado sobre a imagem.
- Grid mais orgânico: cards com respiro, bordas arredondadas, sombra ao passar o mouse, entrada escalonada.
- Filtros e busca com o estilo antigo (campos arredondados, foco dourado).

## 4. "Dentro da academia" vira carrossel
- Substitui o mosaico de três imagens por um carrossel deslizante (arrastar, setas e indicadores, autoplay lento com pausa no hover).
- Cada slide traz imagem, título e um parágrafo explicativo sobre aquele momento (treino, avaliação, sonho, caminho, estrutura).

## 5. Mais texto explicativo
- Parágrafos de apoio nas seções Hero, "Mais que uma peneira", "Como funciona" (o que acontece em cada etapa e o que o atleta recebe), Peneiras e Mapa.
- "Como funciona" ganha uma frase de resultado por etapa e um rodapé com dúvidas rápidas.

## 6. Clubes e parceiros — carrossel de logos
- Faixa de logos em rolagem contínua (marquee) em loop infinito, pausando no hover, com logos em escala de cinza que ganham cor ao passar o mouse.
- As logos serão geradas como imagens de marca dos parceiros já listados (Pelé Academia, Federação Paulista, CT Litoral, Instituto Bola na Rede, Liga Regional Sub-17), em versão que funcione no tema claro e escuro.

## 7. Mapa de oportunidades — elementos ajeitados
- Rótulos de UF sem sobreposição (deslocamento por estado e ocultação em telas pequenas), pontos com tamanho proporcional mais legível e pulso suave nos estados ativos.
- Ponto ativo responde ao cursor: destaque, tooltip com estado e número de peneiras.
- Lista lateral de estados vira itens clicáveis que realçam o ponto correspondente no mapa.

## Notas técnicas
- Novos componentes em `src/components/home/`: `ProximaPeneiraCard.tsx`, `AcademiaCarousel.tsx`, `LogoMarquee.tsx`, mais utilitário de tilt/hover em `src/hooks/use-tilt.ts`.
- `Reveal.tsx` ganha modo `onMount` para as animações de abertura.
- Alterados: `Hero.tsx`, `PeneirasSection.tsx`, `DentroDaAcademia.tsx`, `Parceiros.tsx`, `MapaOportunidades.tsx`, `ComoFunciona.tsx`, `MaisQueUmaPeneira.tsx`.
- Sem mudanças de banco de dados; a imagem da peneira já vem do campo existente com fallback.
