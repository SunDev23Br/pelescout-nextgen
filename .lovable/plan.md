Alterar `src/routes/manual.tsx` para tornar a seção "O que levar no dia" apenas leitura, removendo toda a interatividade de checklist e barra de progresso.

### Alterações
1. **Remover estado e persistência do checklist**
   - Excluir `checked`, `setChecked` e os dois `useEffect` que leem/salvam `localStorage`.
   - Excluir a função `toggleCheck`.

2. **Remover cálculo de progresso**
   - Excluir `progress` e `useMemo` relacionados.
   - Remover a seção de "Preparação" com porcentagem e barra de progresso da sidebar desktop.
   - Remover a seção de progresso do hero mobile.

3. **Transformar a seção "levar" em leitura pura**
   - Substituir os botões de checkbox interativos por uma lista estática (`BulletList` ou similar).
   - Atualizar o texto introdutório, removendo a menção a "marcar" e "progresso salvo".
   - Remover a barra de progresso interna do accordion "levar".

4. **Limpeza de imports**
   - Remover `CheckCircle2` se não for mais usado em outro lugar da página.
   - Manter `Backpack` e demais ícones utilizados.

### Resultado esperado
A seção "O que levar no dia" passa a ser apenas uma lista de itens para leitura, igual às demais seções do manual, sem contadores, checkboxes ou barra de progresso.