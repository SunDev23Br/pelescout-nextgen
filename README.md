Desenvolvido por : Julio Cesar Junior, Vitor Louzano, Miguel Menezes, Pedro Lucas e Arthur Moreira
# Pelé Next Gen

> Plataforma oficial de peneiras de futebol que conecta atletas, olheiros e clubes em todo o Brasil.

O **Pelé Next Gen** organiza seletivas (peneiras) de futebol, hospeda perfis profissionais de atletas com vídeos e estatísticas, e permite que olheiros e clubes acompanhem candidatos, realizem avaliações técnicas e iniciem contato direto.

---

## Sumário

- [📘 Manual do Usuário](docs/manual-do-usuario.md) — guia interativo por papel (Atleta, Olheiro, Clube, Suporte)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Papéis (Roles)](#papéis-roles)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Executando Localmente](#executando-localmente)
- [Deploy](#deploy)
- [Banco de Dados](#banco-de-dados)
- [Segurança (RLS)](#segurança-rls)
- [Scripts Úteis](#scripts-úteis)
- [Design System](#design-system)
- [Licença](#licença)

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Framework | [TanStack Start v1](https://tanstack.com/start) (React 19 + SSR/SSG) |
| Build Tool | [Vite 7](https://vitejs.dev) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com) |
| Componentes UI | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| Estado & Cache | [TanStack Query](https://tanstack.com/query) |
| Roteamento | [TanStack Router](https://tanstack.com/router) (file-based) |
| Backend / DB / Auth | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Ícones | [Lucide React](https://lucide.dev) |
| Formulários | React Hook Form + Zod |
| Gráficos | [Recharts](https://recharts.org) |
| Deploy (Frontend) | Cloudflare Workers (via Wrangler) ou Vercel |

---

## Arquitetura

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Navegador     │────▶│  Cloudflare /    │────▶│   Supabase      │
│   (React SPA)   │◀────│  Vercel (SPA)    │◀────│   (Backend)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                               │
        │  - Auth (OAuth Google, email)                 │  - PostgreSQL
        │  - DB via PostgREST/RLS                       │  - Auth Admin API
        │  - Storage (vídeos, imagens, chat)            │  - Storage buckets
        │  - Realtime (chat, presença)                  │  - Edge Functions
        │                                               │  - Row Level Security
```

- **Frontend**: SPA React compilado pelo Vite. Roteamento client-side com TanStack Router.
- **Backend**: Banco, autenticação, storage e edge functions residem no Supabase (Lovable Cloud).
- **Server Functions**: As `createServerFn` do TanStack Start funcionam como RPC tipado entre frontend e backend.
- **Public API**: Webhooks e endpoints chamados externamente ficam em `/api/public/*`.

---

## Funcionalidades

### Para Atletas
- **Cadastro e Login** com email/senha ou Google OAuth.
- **Perfil Profissional** com foto, posição, cidade, estado, vídeos e estatísticas.
- **Inscrição em Peneiras** abertas, com controle de vagas e jogos.
- **Avaliações** recebidas de olheiros (técnica, tática, física, mental, intensidade).
- **Chat** com olheiros e clubes que entram em contato.
- **Wearables** (opcional): conecte dispositivos para sincronização de métricas.

### Para Olheiros (Admin)
- **Dashboard** com visão geral de candidatos, peneiras e avaliações.
- **Gerenciamento de Peneiras**: criar, editar e organizar seletivas.
- **Avaliação de Candidatos**: sistema de notas com radar de habilidades, tags positivas/negativas, comentários e decisão (aprovado / reprovado / reavaliar).
- **Chat** com atletas e clubes.

### Para Clubes
- **Busca de Talentos** entre atletas avaliados.
- **Desbloqueio de Contato**: paga-se para desbloquear o contato de um atleta antes de iniciar conversa.
- **Chat Direto** apenas com atletas desbloqueados.
- **Acompanhamento** de avaliações, vídeos e métricas dos atletas.

### Para Suporte
- **Aprovação de Cadastros** de administradores e clubes.
- **Gerenciamento de Papéis** (sem permitir auto-escalada para admin/suporte).

---

## Papéis (Roles)

| Papel | Descrição | Áreas Acessíveis |
|-------|-----------|------------------|
| `atleta` | Jogador cadastrado | `/peneiras`, `/perfil`, `/perfil-atleta`, `/chat` |
| `admin` | Olheiro / Administrador | `/dashboard`, `/peneiras`, `/candidatos`, `/avaliacoes`, `/chat`, `/usuarios` |
| `clube` | Clube / Instituição | `/clubes`, `/candidatos`, `/chat` |
| `suporte` | Suporte técnico | `/suporte`, `/dashboard`, `/clubes`, `/candidatos` |

Hierarquia de privilégios: `suporte` > `admin` > `clube` > `atleta`.

---

## Estrutura de Pastas

```
pelescout-nextgen/
├── public/                       # Assets estáticos, favicon, llms.txt
├── scripts/                      # Scripts utilitários (ex.: validação de cadastros admin)
├── src/
│   ├── components/               # Componentes React reutilizáveis
│   │   ├── ui/                   # shadcn/ui (Button, Input, Dialog, etc.)
│   │   ├── chat/                 # Chat (MessageList, MessageComposer, etc.)
│   │   └── evaluation/           # Avaliação (RadarPreview, EvaluationCard, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── integrations/
│   │   ├── lovable/              # Lovable Cloud Auth
│   │   └── supabase/
│   │       ├── client.ts         # Cliente Supabase (browser + SSR)
│   │       ├── client.server.ts  # Cliente Supabase admin (service role)
│   │       ├── auth-middleware.ts
│   │       ├── auth-attacher.ts
│   │       └── types.ts          # Tipos gerados do schema
│   ├── lib/                      # Lógica de negócio
│   │   ├── session.ts            # Sessão e roles
│   │   ├── chat.ts               # Conversas, mensagens, mídia
│   │   ├── avaliacoes.ts         # Avaliações e cálculo de notas
│   │   ├── peneiras.db.ts        # CRUD de peneiras
│   │   ├── peneiras.functions.ts # Server functions de peneiras
│   │   ├── athlete-videos.ts     # Vídeos de atletas
│   │   ├── inscricoes.ts         # Inscrições em peneiras
│   │   ├── wearables.ts
│   │   └── wearables.server.ts
│   ├── routes/                   # Rotas file-based do TanStack Router
│   │   ├── api/                  # Server routes (webhooks, APIs públicas)
│   │   ├── __root.tsx            # Root layout (HTML shell, meta tags)
│   │   ├── index.tsx             # Landing
│   │   ├── login.tsx
│   │   ├── cadastro.tsx
│   │   ├── dashboard.tsx
│   │   ├── peneiras.index.tsx
│   │   ├── peneiras.$peneiraId.tsx
│   │   ├── peneiras.criar.tsx
│   │   ├── candidatos.index.tsx
│   │   ├── candidatos.$candidatoId.tsx
│   │   ├── avaliacoes.tsx
│   │   ├── clubes.tsx
│   │   ├── chat.tsx
│   │   ├── perfil.tsx
│   │   ├── perfil-atleta.tsx
│   │   ├── suporte.tsx
│   │   ├── registro-admin.tsx
│   │   └── registro-clube.tsx
│   ├── router.tsx                # Configuração do TanStack Router
│   ├── routeTree.gen.ts          # Gerado automaticamente (não edite)
│   └── styles.css                # Tailwind v4 + design tokens
├── supabase/
│   ├── migrations/               # Migrações SQL
│   └── functions/                # Edge Functions
├── .env                          # Variáveis de ambiente (não commitar)
├── package.json
├── vite.config.ts
├── wrangler.jsonc                # Cloudflare Workers
├── vercel.json                   # Vercel (SPA rewrite)
└── tsconfig.json
```

---

## Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sua-anon-key>
VITE_SUPABASE_PROJECT_ID=<seu-project-id>

# Para server functions / SSR
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<sua-anon-key>
SUPABASE_PROJECT_ID=<seu-project-id>
```

> **Nota**: A `SUPABASE_SERVICE_ROLE_KEY` não é necessária para o funcionamento normal do app.

---

## Executando Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org) 22+
- [Bun](https://bun.sh) 1.2+ (opcional, mais rápido)

### Instalação

```bash
git clone <url-do-repo>
cd pelescout-nextgen
npm install      # ou: bun install
```

### Desenvolvimento

```bash
npm run dev      # ou: bun run dev
```

Disponível em `http://localhost:8080`.

### Build de Produção

```bash
npm run build    # ou: bun run build
```

Output em `dist/`.

---

## Deploy

### Opção 1: Cloudflare Workers (padrão)

```bash
npx wrangler login
npm run deploy   # vite build && wrangler deploy
```

Configuração em `wrangler.jsonc`:

```jsonc
{
  "name": "pelescout-nextgen",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "dist/server/index.mjs",
  "vars": {
    "SUPABASE_URL": "https://<seu-projeto>.supabase.co",
    "SUPABASE_PUBLISHABLE_KEY": "<sua-anon-key>"
  }
}
```

### Opção 2: Vercel (SPA estático)

1. Importe o repositório no [Vercel](https://vercel.com).
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Adicione as variáveis `VITE_SUPABASE_*` em Project Settings → Environment Variables.

O `vercel.json` já trata o SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Banco de Dados

PostgreSQL hospedado no Supabase. Principais tabelas:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários |
| `user_roles` | Papéis (`atleta`, `admin`, `clube`, `suporte`) |
| `peneiras` | Seletivas/peneiras |
| `candidatos` | Inscrições em peneiras |
| `avaliacoes` | Avaliações técnicas |
| `athlete_videos` | Vídeos dos atletas |
| `conversations` | Conversas do chat |
| `messages` | Mensagens do chat |
| `contatos_desbloqueados` | Relação clube → atleta desbloqueado |
| `admin_requests` | Solicitações de cadastro admin |
| `clube_requests` | Solicitações de cadastro clube |
| `chat_blocks` | Bloqueios no chat |
| `chat_reports` | Denúncias no chat |
| `user_presence` | Presença online/offline |

Migrações ficam em `supabase/migrations/`.

---

## Segurança (RLS)

O projeto usa **Row Level Security (RLS)** em todas as tabelas públicas.

### Princípios

1. **Clubes só veem atletas desbloqueados** — precisam pagar para acessar vídeos, perfis e iniciar chat.
2. **Admin e Suporte bypassam restrições de desbloqueio.**
3. **Suporte não pode se auto-escalar** — não pode atribuir os papéis `admin` ou `suporte`.
4. **Buckets de Storage protegidos** (`athlete-videos`, `chat-media`) com políticas RLS próprias.
5. **Funções `SECURITY DEFINER`** evitam recursão de RLS:

```sql
public.has_role(_user_id uuid, _role app_role) -> boolean
public.clube_has_unlocked_atleta(_clube_id uuid, _atleta_id uuid) -> boolean
```

---

## Scripts Úteis

```bash
npm run dev          # Dev server (Vite)
npm run build        # Build de produção
npm run build:dev    # Build em modo dev
npm run preview      # Preview local do build
npm run deploy       # Build + deploy no Cloudflare
npm run lint         # ESLint
npm run format       # Prettier
```

### Validação de Cadastros Admin

```bash
pip install supabase python-dotenv
python scripts/validate_admin_requests.py
```

Veja [`scripts/README.md`](scripts/README.md) para detalhes.

---

## Design System

Tema escuro com paleta azul-marinho e acentos dourados.

### Cores

| Token | Cor | Uso |
|-------|-----|-----|
| `--gold` | `#d4af37` | Primária, botões, destaques |
| `--gold-light` | `#f0d060` | Hover, gradientes |
| `--blue` | `#005baa` | Secundária |
| `--blue-dark` | `#003d73` | Fundos profundos |
| `--background` | `#0a1628` | Fundo principal |
| `--bg2` | `#0f1e33` | Cards e surfaces |
| `--success` | `#2ecc71` | Aprovado |
| `--error` | `#e74c3c` | Erro / reprovado |

### Tipografia

- **Headings**: Poppins (600–900)
- **Body**: Inter (400–700)

---

## Licença

Projeto de uso privado da **Pelé Next Gen — Academia**.

---

<p align="center">
  <strong>Pelé Next Gen</strong> — A nova geração do futebol começa aqui! ⚽
</p>
