## Objetivo
Ocultar completamente a área de inscrição na página de detalhe da peneira (`/peneiras/$peneiraId`) quando o usuário está logado como **clube** ou **admin** (e também **suporte/olheiro**, que caem no mesmo grupo "não-atleta").

## Arquivo
`src/routes/peneiras.$peneiraId.tsx`

## Comportamento atual
O card lateral "Inscrição" sempre aparece. Para usuários não-atletas, o botão fica desabilitado com texto tipo "Apenas atletas podem se inscrever" / "Olheiros não se inscrevem", e abaixo há um aviso explicando o motivo.

## Mudança
Renderizar o card inteiro de inscrição (preço "Gratuita", limite, botão "Inscrever-se", AlertDialog de confirmação e o aviso de termos) **somente quando**:
- não houver usuário logado (visitante), **ou**
- o usuário logado for **atleta**.

Para `clube`, `admin` (e demais não-atletas), o card de inscrição não aparece. O restante da página (hero, "Sobre a peneira", cronograma, "O que levar", e — para admin/clube em peneiras privadas — o card de "Link de convite para olheiros") continua igual.

## Detalhes
- Envolver o bloco do card de inscrição em `{(!user || isAtleta) && (...)}`.
- Remover os textos condicionais "Apenas atletas podem se inscrever" / "Olheiros não se inscrevem" e o aviso correspondente, que ficam obsoletos.
- Sem alteração na lógica de inscrição para atletas nem no modal de confirmação.