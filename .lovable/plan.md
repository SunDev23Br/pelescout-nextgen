## Problema

O card de inscrição aparece para usuários logados como **clube** e **admin** ao carregar a página, mesmo já existindo a condição `(!user || isAtleta)`.

**Causa:** o hook `useSession()` começa com `user = null` enquanto a sessão do Supabase ainda está carregando. Nesse intervalo, `!user` é `true` e o card aparece — só some depois que a sessão termina de carregar (e aí o React re-renderiza com o role correto). Para clube/admin isso significa "flash" do card no carregamento.

## Correção

Em `src/routes/peneiras.$peneiraId.tsx`:

1. Ler também o `ready` do hook: `const { user, ready } = useSession();`
2. Trocar a condição que envolve o card de inscrição (linha 237):
   - **De:** `{(!user || isAtleta) && (...)}`
   - **Para:** `{ready && (!user || isAtleta) && (...)}`

Assim, enquanto a sessão carrega, nada é renderizado no lugar do card; quando resolve, o card só aparece para visitantes não logados ou atletas. Clube e admin nunca veem o card (nem em flash).

Nenhuma outra alteração é necessária — o restante da página (hero, "Sobre", cronograma, "O que levar", e o card de link de convite para olheiros) continua igual.