## Problema

Hoje a página `/clubes` mostra apenas atletas vindos da tabela `candidatos` com `status='aprovado'`. Na página `/avaliacoes` existem dois caminhos de aprovação:

1. **Peneira selecionada** → grava em `candidatos` e atualiza `status='aprovado'`. Já aparece em `/clubes`.
2. **"Todos os atletas"** → grava só em `avaliacoes` com `decisao='aprovado'` e `atleta_user_id`. **Não aparece** em `/clubes` porque não cria linha em `candidatos`.

A página de clubes precisa exibir os dois casos.

## Solução

Fazer `/clubes` consolidar as duas fontes em uma única lista de atletas aprovados, deduplicada pelo `user_id` do atleta.

### Fonte 1 — Peneira
```
SELECT em candidatos WHERE status='aprovado' AND user_id IS NOT NULL
```

### Fonte 2 — Avaliação ao vivo "Todos os atletas"
```
SELECT em avaliacoes WHERE decisao='aprovado' AND atleta_user_id IS NOT NULL
```
Pega a avaliação mais recente por atleta.

### Deduplicação
Se um atleta foi aprovado pelos dois caminhos, mantém um único card (prioriza a fonte com peneira, para preservar o título "Aprovado em: <peneira>").

## Desbloqueio de contato

A tabela `contatos_desbloqueados` usa `candidato_id` (sem FK), mas hoje só é alimentada com IDs de `candidatos`. Para atletas aprovados via "Todos os atletas" (que não têm linha em `candidatos`), o desbloqueio passa a usar o `user_id` do atleta como chave.

- Card vindo de `candidatos` → key = `candidatos.id` (igual hoje, sem migração)
- Card vindo só de `avaliacoes` → key = `profiles.id` (user_id do atleta)

`unlockContato`, `session.contatosDesbloqueados` e a comparação no chat continuam funcionando porque tratam o campo como uuid opaco.

## Restrição do chat (já implementada)

Atualizar `getUnlockedAtletaUserIds()` em `src/lib/chat.ts` para também considerar entradas de `contatos_desbloqueados` cujo `candidato_id` é, na verdade, um `profiles.id` (quando não há candidato correspondente). Assim clubes que pagaram por um atleta aprovado via "Todos os atletas" também podem mandar mensagem.

## Arquivos afetados

- `src/routes/clubes.tsx` — buscar das duas fontes, deduplicar, usar `user_id` como chave de desbloqueio quando não houver candidato.
- `src/lib/chat.ts` — `getUnlockedAtletaUserIds` passa a aceitar IDs de desbloqueio que já são user_ids de atletas (atletas aprovados sem candidato).
- Nenhuma alteração no schema do banco.

## O que não muda

- Fluxo de aprovação na `/avaliacoes` continua igual.
- `candidatos.user_id NOT NULL` continua sendo requisito para aparecer em `/clubes` (atletas sem cadastro no sistema não podem receber mensagem).
- Preço e dialog de pagamento idênticos.
