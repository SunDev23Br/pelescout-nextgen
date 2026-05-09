## Objetivo
Adicionar uma etapa de confirmação ao se inscrever em uma peneira. Ao clicar em "Inscrever-se", o botão é substituído por dois: **Confirmar inscrição** (verde) e **Cancelar** (vermelho).

## Arquivo
`src/routes/peneiras.$peneiraId.tsx`

## Mudanças
1. **Novo estado** `confirmando` (boolean) no componente `PeneiraDetalhe`.
2. **Comportamento do botão atual "Inscrever-se":**
   - Quando clicado por um atleta logado e elegível, em vez de já inscrever, define `confirmando = true`.
   - As outras condições (não logado, clube, olheiro, encerrada, sem vagas) seguem inalteradas.
3. **Quando `confirmando === true`**, ocultar o botão atual e renderizar dois botões lado a lado:
   - **Confirmar inscrição** — fundo verde (`bg-success` / `hover:bg-success/90`, texto branco), chama `inscrever()` (que mantém o `setInscrito(true)` + toast de sucesso).
   - **Cancelar** — fundo vermelho (`bg-destructive` / `hover:bg-destructive/90`), apenas faz `confirmando = false`.
4. Após confirmar, o fluxo segue para a tela de "Inscrição confirmada!" já existente.

## Detalhes visuais
- Layout: `grid grid-cols-2 gap-2 mt-5` para os dois botões.
- Manter mesma altura (`h-10` / `size="lg"`) e tipografia do botão original.
- Usar tokens semânticos do design system (`success`, `destructive`) — sem cores hardcoded.

Sem alterações em lógica de negócio, dados ou outras rotas.