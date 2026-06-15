## Objetivo

Mostrar na aba **Candidatos** todos os usuários reais que criaram conta com papel `atleta`, removendo os 12 jogadores fictícios do mock.

## Mudanças

### 1. Nova server function — `src/lib/atletas.functions.ts`
- `listAtletas()` (`createServerFn`, GET, com `requireSupabaseAuth`).
- Restringe acesso a `admin` ou `clube` (via `has_role`).
- Retorna `profiles` JOIN `user_roles` onde `role='atleta'`: `id, nome, avatar_url, posicao, cidade, data_nascimento, altura, peso, pe, email, celular`.
- Para cada atleta, traz `notaGeral` e `status` derivados da última avaliação em `public.avaliacoes` (média de tecnica/fisico/tatico/psicologico; status = `aprovado` se média ≥ 3, `avaliado` se < 3, `pendente` se sem avaliação).

### 2. `src/routes/candidatos.index.tsx`
- Remover import de `candidatos`/`Candidato` de `@/lib/mock-data`.
- Carregar via `useServerFn(listAtletas)` + `useQuery` (loading skeleton + estado vazio).
- Definir tipo local `AtletaItem` com os mesmos campos usados hoje (`id, userId, nome, avatar, posicao, cidade, dataNascimento, altura, peso, pe, email, celular, notaGeral, status`). Como agora todo atleta tem conta, `userId = id` sempre — os botões de chat/perfil ficam sempre habilitados.
- Manter filtros de busca e status; manter visão de Clube (cards com desbloqueio).
- Como não há mais "candidatos sem conta", remover os botões desabilitados / tooltip "Candidato sem conta no app".

### 3. `src/routes/candidatos.$candidatoId.tsx`
- Trocar o `loader` mock por um server fn `getAtleta(id)` (mesma proteção admin/clube) que retorna o profile + última avaliação.
- Remover referência a `peneira` (atletas reais não estão vinculados a peneira mock).
- Manter o radar/contato/desbloqueio existentes.

### 4. Mock data
- Não deletar `src/lib/mock-data.ts` (peneiras ainda usam mock). Apenas remover o array `candidatos` e os helpers `getCandidato`, `getCandidatosPorPeneira`, `getCandidatosDoJogo` se não houver mais usos; caso usados em outras telas (peneiras), manter mas esvaziar `candidatos` para `[]` e ajustar telas de peneira para mostrar "Sem candidatos" — confirmar com `rg` antes de editar.

### 5. Sem migração de banco
Tabelas `profiles`, `user_roles`, `avaliacoes` já existem com RLS adequada. A server fn usa o client autenticado (RLS aplicada).

## Resumo de arquivos
- criar: `src/lib/atletas.functions.ts`
- editar: `src/routes/candidatos.index.tsx`, `src/routes/candidatos.$candidatoId.tsx`, possivelmente `src/lib/mock-data.ts` e telas de peneiras que referenciam candidatos mock
