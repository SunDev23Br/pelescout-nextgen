## Objetivo

Permitir testar todo o fluxo de wearables (conectar, sincronizar, exibir métricas para olheiros/clubes) **sem precisar de um smartwatch real**, criando um provider simulado "Mock Wearable" que gera dados realistas de batimentos, passos, distância e velocidade.

## O que será entregue

### 1. Novo provider `mock` no backend
- Adicionar `"mock"` como provedor válido em `src/lib/wearables.server.ts` e `src/lib/wearables.ts`.
- **Não usa OAuth** — a "conexão" é criada instantaneamente via endpoint dedicado, sem redirect ao Google.
- A função de sync gera dados aleatórios mas plausíveis para os últimos N dias (ex: 6.000–12.000 passos/dia, BPM médio 60–85, distância 4–9 km, velocidade 4–6 km/h), gravando em `wearable_daily_metrics` com `provider = 'mock'`.

### 2. Novos endpoints
- `POST /api/wearables/mock/connect` — cria uma `wearable_connection` fake para o usuário logado e dispara o primeiro sync (gera ~7 dias de histórico).
- O endpoint existente `/api/wearables/sync` passa a sincronizar também conexões `mock` (gera o dia de hoje, mantendo o histórico anterior).

### 3. UI no `/perfil` (componente `WearableConnections`)
- Acrescentar botão **"Conectar dispositivo simulado (teste)"** ao lado do botão atual do Google Fit.
- Aparece sempre, com um pequeno rótulo "modo de teste" para deixar claro que são dados fictícios.
- Após conectar, mostra a conexão na lista com label "Smartwatch simulado", permitindo sincronizar e desconectar como qualquer outra.

### 4. Exibição no perfil do atleta
- Nenhuma mudança necessária em `WearableMetricsCard` — ele já lê de `wearable_daily_metrics` independentemente do provider, então os dados simulados aparecem automaticamente para olheiros/clubes na vitrine.

### 5. Segurança
- O endpoint só cria conexão para o `auth.uid()` do bearer token (mesma proteção dos outros endpoints).
- Limitado a 1 conexão `mock` por usuário (evita poluir o banco se clicar várias vezes — botão vira "Regenerar dados de teste").
- Dados ficam isolados ao próprio usuário pelas policies RLS já existentes em `wearable_daily_metrics`.

## Detalhes técnicos

- Sem novas migrações: aproveitamos as tabelas atuais. Não é preciso alterar enums porque `provider` em `wearable_connections` já é `text`.
- Geração determinística-com-jitter: `seed = hash(userId + date)` para que cada atleta tenha um "perfil" consistente entre re-sincronizações.
- O cron diário existente (`/api/public/hooks/sync-wearables`) também processará conexões mock, gerando 1 dia novo a cada execução — útil para ver a vitrine evoluir.

## Como você vai testar

1. Em `/perfil`, clicar **"Conectar dispositivo simulado"** → toast de sucesso, conexão aparece na lista.
2. Abrir a vitrine pública (`/perfil-atleta`) ou ver como olheiro → o card "Métricas do wearable" já mostra BPM, passos, distância e velocidade dos últimos 7 dias.
3. Clicar **"Sincronizar agora"** para gerar/atualizar o dia corrente.
4. Quando tiver um smartwatch real, basta desconectar o simulado e conectar via Google Fit — nada mais muda.
