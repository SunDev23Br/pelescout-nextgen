# Modo claro/escuro + varredura de bugs

## 1. Sistema de tema (claro/escuro)

**Tokens de cor**
- Em `src/styles.css`, hoje `:root` contém a paleta escura (bg azul-marinho + dourado) e `.dark` está vazio.
- Reorganizar: mover a paleta atual para `.dark` e criar em `:root` uma paleta clara equivalente (fundo off-white, superfícies em cinza-claro, texto escuro, mantendo dourado e azul como acento). Ajustar `--background`, `--bg2`, `--bg3`, `--foreground`, `--muted-foreground`, `--border`, `--input`, `--sidebar*`, `--card`, `--popover`, gradientes e sombras para versões claras coerentes.
- Garantir contraste WCAG AA nos dois modos (texto sobre dourado, badges, botões ghost/outline).

**Provider de tema**
- Criar `src/lib/theme.tsx` com `ThemeProvider` + hook `useTheme()`:
  - Estado: `"light" | "dark" | "system"`.
  - Persistência em `localStorage` (`png-theme`).
  - Aplica classe `dark` em `<html>` conforme escolha ou `prefers-color-scheme` quando `"system"`.
  - Escuta mudanças do sistema via `matchMedia`.
  - SSR-safe (só toca `window`/`document` no `useEffect`).
- Injetar `<ThemeProvider>` no `RootComponent` em `src/routes/__root.tsx`.
- Em `RootShell`, remover a classe fixa `dark` do `<html>` e adicionar um pequeno script inline no `<head>` para setar a classe antes da hidratação (evita flash claro→escuro).

**Componente de alternância**
- Criar `src/components/ThemeToggle.tsx`: botão ghost com ícones `Sun`/`Moon`/`Monitor` (lucide) usando `DropdownMenu` do shadcn com opções Claro / Escuro / Sistema.
- Colocar o toggle:
  - No `AppLayout.tsx`: ao lado do `NotificationsBell` (barra mobile e área desktop).
  - Na landing (`src/routes/index.tsx`): no header público.
  - Na tela `/login`: canto superior direito.

**Ajustes de componentes que hardcodam cores escuras**
- Varrer usos de `bg-background/70`, gradientes fixos e classes que assumem tema escuro; substituir por tokens semânticos onde quebrar no modo claro (ex.: overlays do sidebar, backdrop, chat, cards da landing). Sem mudar layout.

## 2. Correção de bugs / varredura

Fazer uma passada rápida verificando:
- Console e network nas rotas principais (`/`, `/login`, `/peneiras`, `/chat`, `/desempenho`, `/clubes`, `/perfil-atleta`, `/ranking`, `/comparador`, `/manual`, `/dashboard`).
- Erros de hidratação após introduzir o tema (classe `dark` no `<html>` precisa bater entre servidor e cliente).
- Realtime do chat/notificações continua funcionando em ambos os temas (nada muda de lógica).
- Corrigir apenas o que realmente aparecer como erro/warn ou UI quebrada; listar no fim da execução o que foi encontrado e o que foi corrigido. Se nada aparecer além do tema, informar isso explicitamente em vez de inventar correções.

## Detalhes técnicos

- Tailwind v4: já existe `@custom-variant dark (&:is(.dark *))` em `styles.css`, então basta alternar a classe `dark` em `<html>`.
- Não criar `tailwind.config.js`.
- Não alterar arquivos auto-gerados (`routeTree.gen.ts`, `integrations/supabase/*`).
- Sem novas dependências: `lucide-react` e `@radix-ui/react-dropdown-menu` já estão no projeto via shadcn.

## Entregáveis
- `src/lib/theme.tsx` (novo)
- `src/components/ThemeToggle.tsx` (novo)
- `src/styles.css` (paleta clara + escura)
- `src/routes/__root.tsx` (provider + script anti-flash, remove `dark` fixo)
- `src/components/AppLayout.tsx`, `src/routes/index.tsx`, `src/routes/login.tsx` (toggle visível)
- Ajustes pontuais em componentes que quebrarem no modo claro
- Relatório final dos bugs encontrados/corrigidos (ou confirmação de que não houve outros)
