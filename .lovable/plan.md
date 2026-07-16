## Causa

A rota `/desempenho` ainda era afetada por uma implementação antiga baseada em server function (`getMeuDesempenho`). Em desenvolvimento, o Vite/TanStack pode manter uma validação em cache para IDs antigos de server functions, gerando `Invalid server function ID` mesmo depois de a rota visual mudar.

## Correção

A aba `/desempenho` foi refeita como rota independente e cliente, usando apenas o cliente autenticado do backend no navegador. Também foi removida a dependência de consultas por campos opcionais para evitar erro quando o banco não tiver avaliações avulsas vinculadas diretamente ao usuário.

## Arquivos

- `src/routes/desempenho.tsx`
