# Redesign do Perfil do Atleta — Estilo FIFA / Scouting Pro

Reformular `src/routes/atletas.$atletaId.tsx` para um layout futurista com sidebar de seções, foto em destaque com glow neon, barras de habilidades animadas, vídeo de destaque e conquistas. Mantém todos os dados já existentes no banco (`profiles`, `athlete_videos`) — apenas muda apresentação.

## Estrutura visual

```
┌──────────────────────────────────────────────┐
│ [sidebar]  │  HERO: foto glow + nome + infos │
│  Perfil    │ ──────────────────────────────  │
│  Avaliações│  SOBRE MIM (bio)                │
│  Vídeos    │  HABILIDADES (barras animadas)  │
│  Fotos     │  VÍDEO DE DESTAQUE              │
│ Conquistas │  CONQUISTAS (troféus)           │
│  Contato   │                                 │
└──────────────────────────────────────────────┘
```

## Mudanças

### 1. Tokens de cor (src/styles.css)
Adicionar variáveis para o tema neon **apenas no escopo do perfil do atleta** (não muda o tema global do app):
- `--neon-cyan: #00D4FF`
- `--neon-blue-deep: #0A0F1C`, `--neon-blue-mid: #0F172A`, `--neon-blue-accent: #1E3A8A`
- Utility `.glow-neon` (box-shadow azul radial) e `.text-glow` (text-shadow cyan)
- Keyframes `skill-bar-fill` (largura 0→valor em 1.2s ease-out)

### 2. `src/routes/atletas.$atletaId.tsx`
- Layout grid 2 colunas: sidebar fixa (56–72px com ícones de `lucide-react`: User, Star, Video, Image, Trophy, Mail) + conteúdo
- Sidebar com scroll-spy: clica num ícone → `scrollIntoView` para a seção; ativa visual no item correspondente
- Hero redesenhado: avatar circular grande com anel duplo + glow cyan, nome em font-display uppercase tracking-wider, posição em destaque cyan, chips de idade/altura/peso/pé numa linha
- Botão "Iniciar conversa" (mantém regra `canStartChat`) com estilo neon

### 3. Nova seção HABILIDADES
Como o schema atual não tem campo de skills, derivar do `stats` + `posicao` com valores default (ex: zagueiro/volante = marcação alta) **OU** ler de `profile.stats.skills` se existir (objeto opcional sem migration). Render:
- 5 barras: Marcação, Força, Passe, Velocidade, Posicionamento
- Cada barra: label + valor 0-100 + trilho escuro + preenchimento gradient cyan→blue com animação de entrada
- Usar `IntersectionObserver` para disparar animação ao entrar na viewport

### 4. VÍDEO DE DESTAQUE
- Pega o vídeo mais recente de `athlete_videos` (já listado pelo `AthleteVideoGallery`)
- Renderizar player único grande com thumbnail (poster gerado do próprio vídeo via `<video preload="metadata">`) e botão play central com glow
- A galeria completa de vídeos continua aparecendo abaixo

### 5. CONQUISTAS
Reaproveitar `historico_clubes` como conquistas se não houver campo dedicado, OU usar `profile.stats.conquistas` (array opcional de `{titulo, ano}`). Render como grid de cards com ícone `Trophy` dourado-cyan.

### 6. Animações & interações
- Hover nos cards: subtle lift + glow cyan
- Transições `transition-all duration-300`
- Barras animam via CSS keyframes triggered por classe `.animate` adicionada quando visível

## Detalhes técnicos

- Sem mudança de schema, sem migration, sem novas dependências
- `useRef` + `IntersectionObserver` para scroll-spy da sidebar e trigger das barras
- Sidebar vira top-bar horizontal em mobile (`md:` breakpoint)
- Mantém SEO `head()`, `canManage`, `canStartChat`, `handleStartChat`, e a `<AthleteVideoGallery>` existente
- Não toca em `perfil.tsx`, `candidatos.index.tsx`, `chat.tsx`, `usuarios.$userId.tsx`

## Arquivos
- editar `src/routes/atletas.$atletaId.tsx` (reescrita do JSX, lógica preservada)
- editar `src/styles.css` (tokens neon + keyframes, escopados via classes para não poluir o tema global)
