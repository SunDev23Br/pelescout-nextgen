## Diagnóstico

Verifiquei o `src/components/AppLayout.tsx` e o `src/lib/session.ts`:

- O item **Candidatos** está hoje liberado para `clube` no menu lateral (`roles: ["admin", "suporte", "clube"]`), por isso aparece junto com Dashboard/Avaliações quando algo dá errado.
- O **Dashboard** e **Avaliações ao vivo** já têm `roles` restritos a `admin`/`suporte`, mas as rotas `/dashboard`, `/avaliacoes` e `/candidatos` ainda são acessíveis por URL para o clube.
- Em `session.ts`, a prioridade é `suporte > admin > clube > atleta`. Se um usuário tiver papel `clube` **e** `admin` na tabela `user_roles`, ele entra como admin e vê todo o painel administrativo. Esse é o cenário mais provável para "ser enviado como olheiro" depois do login de clube.

## Plano

### 1. Limpar o menu lateral do clube (`src/components/AppLayout.tsx`)
Manter para `clube` apenas:
- Peneiras
- Criar peneira
- Atletas aprovados (`/clubes`)
- Meu perfil

Remover `clube` das `roles` do item **Candidatos**.

### 2. Bloquear rotas administrativas para o clube
Adicionar guarda nas páginas que o clube não deve acessar, redirecionando para `/clubes`:
- `src/routes/dashboard.tsx` — já tem guarda; revisar.
- `src/routes/avaliacoes.tsx` — já tem guarda; revisar.
- `src/routes/candidatos.index.tsx` — adicionar redirect quando `role === "clube"`.

### 3. Corrigir resolução de papel no login (`src/lib/session.ts`)
Hoje, se um mesmo `user_id` tem `clube` + `admin` em `user_roles`, ele é tratado como admin e vê o painel administrativo mesmo depois de logar pela tela de clube.

Ajustar `loadSessionUser` para respeitar o papel selecionado no login: o `login.tsx` já sabe qual papel foi escolhido (`selectedRole`); vamos persistir essa escolha (em `sessionStorage`) e usá-la em `loadSessionUser` quando o usuário tiver mais de um papel disponível. Isso evita que um clube com permissões administrativas acabe logado como admin.

### 4. Verificação
- Login de clube deve mostrar **apenas** Peneiras, Criar peneira, Atletas aprovados e Meu perfil.
- Acessar `/dashboard`, `/avaliacoes` ou `/candidatos` por URL como clube redireciona para `/clubes`.
- Login de admin/suporte continua igual.

## Pergunta antes de implementar

A conta de clube que você está testando também tem o papel `admin` na base? Se tiver, a Etapa 3 é necessária. Se não, posso pular a Etapa 3 e fazer só 1 + 2 (mais simples e mais rápido).