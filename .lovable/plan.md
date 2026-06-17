## Objetivo
Permitir que atletas conectem seu smartwatch/app de saúde (Apple Health, Google Fit, Garmin Connect, Fitbit, etc.) e que as métricas — batimentos, passos, distância e velocidade média — apareçam no perfil do atleta, visíveis para ele, olheiros e clubes.

## Viabilidade e abordagem
Sim, é possível. Como os smartwatches são variados, a melhor estratégia é integrar com as **APIs dos fabricantes** (cada uma é o "agregador" dos dados do relógio). Cada provedor exige OAuth **por usuário** (cada atleta autoriza a própria conta), o que é diferente dos connectors de workspace já usados no projeto.

Para a primeira versão, recomendo começar com **2 provedores que cobrem a maior parte do mercado**:
- **Google Fit / Health Connect** (Android + Wear OS + muitos relógios Android)
- **Fitbit Web API** (cobertura ampla, OAuth simples, plano free)

Apple Health **não tem API pública na nuvem** — só roda no iPhone via HealthKit. Para suportá-lo de verdade precisaria de um app iOS nativo. Fica como passo futuro; por ora deixaremos um campo "entrada manual" como fallback.

Garmin Connect API exige aprovação comercial (processo lento). Sugiro deixar para uma fase 2.

## Escopo desta entrega

### 1. Banco de dados (Lovable Cloud)
- `wearable_connections` — vínculo OAuth do atleta com um provedor (provider, access_token, refresh_token, expires_at, scopes, external_user_id, last_sync_at). RLS: atleta gerencia o próprio; suporte vê tudo.
- `wearable_daily_metrics` — uma linha por atleta/dia/provedor com: heart_rate_avg, heart_rate_max, heart_rate_resting, steps, distance_m, speed_avg_kmh, active_minutes, raw_payload (jsonb). RLS: atleta lê o próprio; olheiros (admin) e clubes leem de qualquer atleta; suporte gerencia.
- Tokens ficam criptografados em coluna marcada como sensível, lidos só por server functions.

### 2. Server functions (TanStack `createServerFn`)
- `startOAuth(provider)` — gera URL de autorização e state.
- `handleOAuthCallback(provider, code, state)` — troca code por tokens, salva em `wearable_connections`, dispara primeiro sync.
- `syncWearable(connectionId)` — chama a API do provedor, normaliza para o formato comum (bpm, passos, metros, km/h), faz upsert em `wearable_daily_metrics` para os últimos 7 dias.
- `disconnectWearable(connectionId)` — revoga e apaga.
- `getAthleteMetrics(athleteId, range)` — leitura para o perfil.

### 3. Cron diário
- Server route pública `/api/public/hooks/sync-wearables` protegida por anon key.
- `pg_cron` chama 1x/dia (03:00 BRT) e roda `syncWearable` para cada conexão ativa, com refresh de token quando necessário.

### 4. UI

**Página `/perfil` (atleta):**
- Nova seção "Dispositivos conectados" com botões "Conectar Google Fit" / "Conectar Fitbit", status da conexão, último sync, botão "Sincronizar agora" e "Desconectar".

**Página `/perfil-atleta` (vitrine, vista por olheiros/clubes):**
- Novo card "Métricas do wearable (últimos 7 dias)" com:
  - 4 quick stats: BPM médio, passos/dia, distância/dia (km), velocidade média (km/h)
  - Mini-gráfico (sparkline) por métrica usando `recharts` já presente no projeto
  - Selo "Sincronizado em <data>" ou estado vazio amigável ("Atleta ainda não conectou um dispositivo")

### 5. Secrets necessários
Precisaremos pedir ao usuário (em mensagem separada, via `add_secret`) quando começar a implementação:
- `GOOGLE_FIT_CLIENT_ID` / `GOOGLE_FIT_CLIENT_SECRET`
- `FITBIT_CLIENT_ID` / `FITBIT_CLIENT_SECRET`

Cada um requer criar um app no console do respectivo provedor (Google Cloud Console e dev.fitbit.com) e cadastrar a URL de callback que vamos gerar.

## Fora do escopo desta entrega (sugerido para depois)
- App nativo iOS para Apple Health (HealthKit).
- Integração Garmin (aprovação comercial).
- Tempo real durante peneiras (exige WebSocket / stream — outra arquitetura).
- Alertas/score automático baseado nas métricas.

## Como o atleta vai usar
1. Abre `/perfil` → "Dispositivos conectados" → clica em "Conectar Fitbit".
2. É redirecionado para o login do Fitbit, autoriza.
3. Volta para o perfil, vê "Conectado · sincronizando…".
4. No dia seguinte (ou ao apertar "Sincronizar agora") os dados aparecem no card da vitrine para olheiros.

## Confirmar antes de implementar
- Começamos com **Google Fit + Fitbit** nesta v1? (Apple Health e Garmin ficam como fase 2.)
- Tudo bem que você cadastre os apps no Google Cloud Console e no dev.fitbit.com para obter as credenciais? Vou guiar você passo a passo quando chegarmos lá.
