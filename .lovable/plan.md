## Causa

A nova rota `/desempenho` chama o server function `getMeuDesempenho`, que usa o middleware `requireSupabaseAuth` (exige bearer token). O projeto não tem `src/start.ts` registrando o `attachSupabaseAuth` como `functionMiddleware` cliente, então a chamada vai sem `Authorization` e o backend devolve 401 → 500 → erro `Something went wrong`.

(O componente `DesempenhoTab` já existia, mas só agora ficou exposto como rota própria, expondo a falta do middleware cliente.)

## Correção

Criar `src/start.ts` registrando o middleware gerado:

```ts
import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
```

Isso faz o navegador anexar o `Authorization: Bearer <token>` em toda chamada de `createServerFn`, permitindo que `getMeuDesempenho` (e quaisquer futuros server fns protegidos) funcione e a página `/desempenho` carregue as peneiras anteriores e o feedback.

## Arquivos

- `src/start.ts` (criar)
