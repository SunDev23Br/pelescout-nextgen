## Objetivo
Fazer deploy do frontend da aplicacao no Vercel, mantendo todo o backend (banco de dados, autenticacao, storage, server functions) na Lovable Cloud.

## Por que isso funciona
O projeto eh um TanStack Start + Vite. O Vercel hospeda o build de producao como um SPA estatico, e as chamadas ao backend continuam apontando para a Lovable Cloud via variaveis de ambiente.

## Passos

### 1. Conectar o projeto ao GitHub
- No editor da Lovable, abrir o menu Plus (+) no canto inferior esquerdo do chat
- Selecionar GitHub > Connect project
- Autorizar o app da Lovable no GitHub
- Escolher a conta/organizacao e criar o repositorio
- Apos a conexao, o codigo sincroniza automaticamente a cada mudanca

### 2. Fazer deploy no Vercel
- Acessar vercel.com e criar uma nova importacao do repositorio GitHub
- Framework preset: Vite (o Vercel detecta automaticamente)
- Build command: `npm run build` (ou `bun run build`)
- Output directory: `dist`
- Node version: 22

### 3. Configurar variaveis de ambiente no Vercel
No dashboard do Vercel, ir em Project Settings > Environment Variables e adicionar:

```
VITE_SUPABASE_URL=https://wtpirwbichgwdzlckcuq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cGlyd2JpY2hnd2R6bGNrY3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjYyMSwiZXhwIjoyMDkzNzQ4NjIxfQ.1nepkvwWyyQOcCgBzW4gNv7RwRAK2uzkedWz09q4Wzc
VITE_SUPABASE_PROJECT_ID=wtpirwbichgwdzlckcuq
```

Marcar como aplicaveis a todos os ambientes (Production, Preview, Development).

### 4. Configurar SPA routing no Vercel
Criar o arquivo `vercel.json` na raiz do projeto com:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Isso garante que rotas client-side (como /perfil, /chat, /peneiras) funcionem corretamente no refresh.

### 5. Atualizar OAuth redirect URLs (se usar Google Sign-In)
- Se o app usa login com Google, acessar Google Cloud Console > APIs & Services > Credentials
- Adicionar o dominio do Vercel nas "Authorized redirect URIs"
- Formato: `https://<seu-projeto>.vercel.app`
- O OAuth continua funcionando porque o broker da Lovable gerencia o fluxo

## O que continua na Lovable Cloud
- Banco de dados PostgreSQL
- Autenticacao (login, sessoes, OAuth)
- Storage (imagens, videos)
- Edge Functions (webhooks, cron jobs)
- Server Functions (createServerFn via RPC)

## Limitacoes importantes
- As `createServerFn` continuam funcionando porque sao chamadas via RPC do frontend para a Lovable Cloud
- Server routes (`/api/public/*`) continuam hospedadas na Lovable Cloud
- O cron job diario de sync de wearables continua na Lovable Cloud
- Nao eh possivel mover as server functions para o Vercel sem reescreve-las

## Resultado esperado
O frontend estara hospedado no Vercel com CDN global, cache otimizado e preview deployments a cada PR. O backend continua operando normalmente na Lovable Cloud sem nenhuma mudanca.