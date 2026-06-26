## Mudanças

1. **Remover aba "Desempenho" do perfil do atleta** (`src/routes/perfil-atleta.tsx`):
   - Remover o wrapper `<Tabs>` que dividia "Perfil" e "Desempenho"
   - Voltar o conteúdo do perfil ao estado anterior (sem abas)
   - Remover import de `DesempenhoTab`

2. **Criar nova rota `/desempenho`** (`src/routes/desempenho.tsx`):
   - Rota protegida (somente atletas logados)
   - Usa `AppLayout` como as demais páginas
   - Renderiza o componente `DesempenhoTab` existente (que já busca `getMeuDesempenho` e mostra peneiras anteriores, feedback dos olheiros, gráficos de evolução, radar, decisões e comentários)
   - `head()` com title/description específicos
   - Estado de loading e empty state já tratados dentro do `DesempenhoTab`

3. **Adicionar item "Desempenho" na sidebar** (`src/components/AppLayout.tsx`):
   - Novo `NavItem` no array `NAV`: `{ to: "/desempenho", label: "Desempenho", icon: <ícone do lucide, ex: LineChart>, roles: ["atleta"] }`
   - Visível somente para usuários com role `atleta` (mesma lógica de filtro já existente)

4. **Sem mudanças de backend**: o server function `getMeuDesempenho` e o componente `DesempenhoTab` já existem e continuam funcionando — apenas mudamos onde são renderizados.

## Arquivos afetados

- `src/routes/perfil-atleta.tsx` (editar — remover Tabs)
- `src/routes/desempenho.tsx` (criar)
- `src/components/AppLayout.tsx` (editar — adicionar item de menu)
