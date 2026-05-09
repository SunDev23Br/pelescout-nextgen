## Objetivo

Atualmente, ao publicar uma peneira no formulário "Criar peneira", o código apenas mostra um toast e redireciona — nada é salvo. Vamos persistir a peneira na tabela `peneiras` do banco (já existente).

## Como vai funcionar

1. No `submit` de `src/routes/peneiras.criar.tsx`, em vez de `setTimeout` mock, chamar uma server function `criarPeneira` que insere no banco.
2. A inserção respeita a RLS existente: usuários `clube` (com `created_by = auth.uid()`) e `admin` podem criar.
3. Após sucesso, redireciona para `/peneiras` com toast.

## Mapeamento dos campos do formulário → coluna da tabela `peneiras`

| Form | Coluna |
|---|---|
| `titulo` | `titulo` |
| `cidade` | `cidade` |
| `estado` | `estado` |
| `local` | `local` |
| `data` (YYYY-MM-DD) | `data` |
| `horaInicio` | `hora_inicio` |
| `horaFim` | `hora_fim` |
| `duracaoJogoMin` | `duracao_jogo_min` |
| `participantesPorJogo` | `participantes_por_jogo` |
| `limiteInscricao` (ISO local) | `limite_inscricao` (timestamptz) |
| `visibilidade` | `visibilidade` |
| `descricao` | `descricao` |
| — | `created_by = auth.uid()` |
| — | `categorias = []` (default), `status = 'aberta'` (default), `inscritos = 0` (default), `organizador` (default) |

`invite_token` é gerado quando `visibilidade = 'privada'` (UUID aleatório).

## Implementação técnica

**Novo arquivo `src/lib/peneiras.functions.ts`** com:

```ts
export const criarPeneira = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ...campos... }))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const insert = {
      ...data,
      created_by: userId,
      invite_token: data.visibilidade === "privada" ? crypto.randomUUID() : null,
    };
    const { data: row, error } = await supabase
      .from("peneiras").insert(insert).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
```

**Editar `src/routes/peneiras.criar.tsx`:**
- Substituir o `setTimeout` mock por `await criarPeneira({ data: ... })` via `useServerFn`.
- Tratar erro com `toast.error`.

## Fora de escopo (não muda agora)

- A listagem em `/peneiras` continua lendo o mock — só a criação é persistida. Se quiser que a lista também leia do banco, é um próximo passo.
- Imagem da peneira (`imagem`) — campo não existe no formulário atual; fica `null`.
- Categorias (`categorias`) — campo não existe no formulário atual; fica `[]`.

## Arquivos

- criar: `src/lib/peneiras.functions.ts`
- editar: `src/routes/peneiras.criar.tsx`
