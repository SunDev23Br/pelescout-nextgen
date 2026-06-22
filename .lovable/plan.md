## Problema

A aba `/clubes` consulta `candidatos`, `avaliacoes` e `profiles` direto do front. As políticas RLS atuais só liberam essas tabelas para o clube **depois** que ele já desbloqueou o contato — por isso a lista chega sempre vazia. Simplesmente afrouxar as policies expõe email/celular dos atletas via Data API (rebaixando a regra de negócio do pagamento), então a correção precisa ser feita no servidor com projeção segura de colunas.

## Solução

Criar uma função SQL `SECURITY DEFINER` que devolve apenas campos não-sensíveis dos atletas aprovados, e fazer a página `/clubes` consumi-la. Email e celular continuam protegidos pelas policies atuais e só aparecem após o desbloqueio (que já funciona).

### 1. Migração no banco

Criar `public.list_atletas_aprovados()` (SECURITY DEFINER, `search_path = public`, GRANT EXECUTE para `authenticated`) que:

- Faz `UNION` entre:
  - `candidatos` com `status = 'aprovado'` e `user_id IS NOT NULL` (traz `peneira_id` → título).
  - `avaliacoes` com `decisao = 'aprovado'` e `atleta_user_id IS NOT NULL` que ainda não estejam cobertos pela fonte 1.
- Faz `JOIN` em `profiles` para nome, posição, cidade, data de nascimento, avatar.
- Retorna apenas campos **seguros**: `candidato_id`, `user_id`, `nome`, `posicao`, `cidade`, `data_nascimento`, `avatar_url`, `nota_geral`, `peneira_titulo`. **Não** retorna `email` nem `celular`.
- Restringe execução: `IF NOT (has_role(auth.uid(),'clube') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'suporte')) THEN RAISE EXCEPTION ...`.

### 2. Frontend (`src/routes/clubes.tsx`)

- Substituir o `useEffect` que faz 4 queries por uma única chamada `supabase.rpc("list_atletas_aprovados")`.
- Para cada atleta desbloqueado (`user?.contatosDesbloqueados`), buscar `email`/`celular` em `profiles`/`candidatos` em um segundo passo (as policies atuais já permitem). Atletas não desbloqueados mantêm os campos vazios e o card continua exibindo `•••••• oculto ••••••` com o botão "Liberar contato — R$ X,XX".
- Manter o fluxo de pagamento simulado (`unlockContato`) e o botão "Enviar mensagem" pós-desbloqueio inalterados.

### 3. Sem mudanças

- Policies existentes em `candidatos`/`avaliacoes`/`profiles` não são alteradas (continuam restritivas).
- Nada muda para perfis atleta/admin/suporte.
- `PRECO_CONTATO_BRL`, dialog de pagamento e chat continuam iguais.

## Resultado

Clubes passam a ver **todos** os atletas aprovados com nome, posição, cidade, idade, nota e peneira de origem, mas com email/celular ocultos atrás do botão de pagamento — exatamente o comportamento pedido.
