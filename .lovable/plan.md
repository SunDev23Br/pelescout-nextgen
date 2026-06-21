## Objetivo

Adicionar na página `/login` um botão "Ouvir página" que lê em voz alta o conteúdo principal da tela (título, instruções, labels dos campos e botões), usando Lovable AI (TTS) com streaming SSE.

## Arquitetura

```text
[LoginPage] --click--> [POST /api/tts] --SSE--> [Lovable AI Gateway]
     |                                              (openai/gpt-4o-mini-tts)
     |<-- PCM 24kHz chunks (base64) ----------------|
     |
   AudioContext: decodifica e toca em tempo real
```

Voz padrão: `alloy`. Idioma: o texto é em português; o modelo infere o idioma automaticamente.

## Mudanças

1. **Backend — server route SSE** `src/routes/api/tts.ts`
   - `POST` recebe `{ text: string, voice?: string }` (validado com Zod).
   - Limita tamanho (`text.length <= 2000`) e faz chunking por sentença se necessário (a /login envia ~1 chunk).
   - Chama `https://ai.gateway.lovable.dev/v1/audio/speech` com `Authorization: Bearer ${LOVABLE_API_KEY}`, `model: "openai/gpt-4o-mini-tts"`, `stream_format: "sse"`, `response_format: "pcm"`.
   - Retorna `response.body` direto, `Content-Type: text/event-stream`.
   - Trata `request.signal` (cancelamento) devolvendo 499.
   - Mapeia 402/403/404/429 do gateway para mensagens claras.

2. **Hook de cliente** `src/hooks/use-tts.ts`
   - Expõe `{ speak(text), stop(), isSpeaking, isLoading }`.
   - Cria `AudioContext({ sampleRate: 24000 })`, faz `resume()` dentro do handler de clique.
   - Usa `eventsource-parser` para ler `speech.audio.delta` (base64 → PCM Int16 → Float32) e agenda buffers no `AudioContext`.
   - Mantém `AbortController` para `stop()`.
   - Dependência nova: `eventsource-parser` (instalar com `bun add`).

3. **UI na /login** `src/routes/login.tsx`
   - Adicionar botão flutuante/secundário no topo do card de login: "Ouvir página" (ícone `Volume2`) que alterna para "Parar" (ícone `VolumeX`) enquanto toca.
   - `aria-label` dinâmico ("Ouvir conteúdo da página" / "Parar leitura"); `aria-pressed` reflete `isSpeaking`.
   - Região `aria-live="polite"` invisível para anunciar estado ("Lendo página…", "Leitura finalizada", "Erro ao gerar áudio").
   - Texto narrado é construído estaticamente em PT-BR cobrindo: título da página, seletor de papel (com a opção ativa), instruções dos campos email/senha, opções de login (Google), e links para cadastro (atleta, clube, administrador).

4. **Sem mudanças** em outras rotas, design system ou lógica de auth.

## Detalhes técnicos

- **Chave**: `LOVABLE_API_KEY` já existe no ambiente Lovable Cloud — nada para o usuário configurar.
- **Streaming**: PCM 24kHz mono, decodificado por chunk, com playhead acumulado (`ctx.currentTime + 0.05` no primeiro chunk para evitar corte inicial).
- **Cancelamento**: ao clicar "Parar" ou ao desmontar a página, `AbortController.abort()` cancela o fetch; o `AudioContext` é fechado e recriado na próxima chamada.
- **Acessibilidade**: o botão é o único elemento adicionado à UI; não substitui leitores de tela nativos (NVDA/VoiceOver) — é um complemento auditivo on-demand.
- **Erro 402/403/429**: o hook mostra `toast.error()` com mensagem amigável.

## Fora de escopo

- Não adicionar TTS em outras páginas (pode ser estendido depois reusando o hook).
- Não fazer melhorias ARIA mais amplas (você escolheu apenas o botão TTS).
- Não cachear áudio (texto da /login é curto e raramente clicado).
