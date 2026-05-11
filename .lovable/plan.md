## Mover badges de categorias (Sub-X) para abaixo do status de inscrição

Hoje, no card de cada peneira, as categorias (Sub-9, Sub-11, etc.) aparecem flutuando no canto superior direito da imagem, sobrepondo a foto e podendo quebrar em várias linhas em telas menores. O usuário pediu para movê-las para **abaixo do status de inscrição**, de forma acessível e responsiva.

### Arquivo a alterar
- `src/components/PeneiraCard.tsx`

### Mudanças

1. **Remover** o bloco flutuante de categorias que hoje fica no canto superior direito da imagem (`absolute right-4 top-4 ...`).

2. **Adicionar** uma nova linha de categorias logo abaixo do bloco de informações de inscrição (após o item "X/Y inscritos" e antes da barra de progresso), dentro do corpo do card.

3. **Estilo das pílulas** (mantém a linguagem visual atual, mas adaptada para fundo do card em vez de overlay):
   - container: `flex flex-wrap gap-1.5` com `role="list"` e `aria-label="Categorias da peneira"`
   - cada pílula: `role="listitem"`, `rounded-full border border-border bg-bg2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground`
   - sem truncamento — quebra naturalmente em múltiplas linhas em telas estreitas

4. **Acessibilidade**:
   - container com `aria-label` descritivo
   - cada categoria como `listitem` para leitores de tela
   - contraste adequado (texto `muted-foreground` sobre `bg2`, ambos do design system)
   - sem dependência de cor para significado

5. **Responsivo**: como passam a viver no fluxo normal do card (não mais `absolute`), as pílulas se ajustam naturalmente ao card em qualquer largura, sem cobrir a imagem nem sair da área visível.

### O que NÃO muda
- A tela de criação de peneiras (`peneiras.criar.tsx`) continua igual.
- StatusBadge, badge de "Privada", título, ícones de local/data/inscritos, barra de progresso e botão permanecem intactos.
- Cálculos, dados e rotas não mudam.