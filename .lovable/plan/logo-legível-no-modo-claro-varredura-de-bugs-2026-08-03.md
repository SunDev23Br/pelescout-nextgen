# Logo legível no modo claro + varredura de bugs

## Problema do logo

O arquivo de logo atual tem a palavra "Pelé" escrita em **branco**. No modo escuro fica perfeita, mas no modo claro (fundo off-white) a palavra some — só aparecem o "10" e "Next Gen".

## Solução

1. Gerar uma variante do logo para o modo claro, com "Pelé" em **azul-marinho** (o mesmo azul do "10", garantindo contraste e combinando com a identidade).
2. Atualizar o componente `Logo` para escolher a imagem conforme o tema ativo (usa o `ThemeProvider` já existente), sem piscar na troca.
3. O modo escuro continua exatamente como está hoje.

## Varredura de erros e bugs

- Rodar typecheck e build completos.
- Percorrer as rotas públicas e autenticadas no navegador headless, coletando erros de console, requisições com falha (400/404/500) e telas quebradas.
- Conferir especificamente o modo claro: textos com contraste insuficiente, ícones brancos sobre fundo claro, bordas invisíveis e badges ilegíveis nas telas principais (landing, login, peneiras, perfil, chat, ranking, comparador).
- Corrigir o que aparecer e revalidar rodando a mesma varredura.

## Detalhes técnicos

- Novo asset `src/assets/pele-next-gen-logo-light.png` (texto "Pelé" em `#123164`).
- `src/components/Logo.tsx` passa a consumir o hook de tema e trocar o `src`.
- Cores fora do padrão encontradas na varredura serão migradas para tokens semânticos de `src/styles.css` em vez de classes fixas.
