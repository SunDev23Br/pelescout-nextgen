# Perfil de olheiro editável

Hoje a página `/perfil-olheiro` mostra dados reais só de nome, foto, cidade, celular, e-mail e bio (vindos do cadastro). Especialidades, posições observadas, experiência, competições, redes sociais e o status "Recebendo vídeos" são valores fixos escritos no código — iguais para todo olheiro e impossíveis de alterar.

O objetivo é deixar tudo isso editável pelo próprio olheiro, direto na página do perfil.

## O que vai poder ser editado

Header e identidade
- Foto (mesmo upload com recorte de rosto já usado no atleta)
- Nome, cargo/título (ex.: "Scout Independente"), cidade/UF
- Bio ("Sobre mim")

Atuação
- Especialidades (categorias: Sub-11 a Profissional, Feminino) — seleção múltipla por chips
- Posições que costuma observar — seleção múltipla
- Competições acompanhadas — lista livre, adicionar/remover
- Experiência — itens com período e cargo/clube, adicionar, editar, reordenar e remover

Contato e disponibilidade
- WhatsApp, e-mail de contato, Instagram, LinkedIn
- Botão "Recebendo vídeos / Agenda fechada" passa a salvar de verdade

As estatísticas (observados, avaliações, indicações, aprovados, média) continuam calculadas automaticamente e não são editáveis — são a prova social do perfil.

## Como funciona na tela

Na versão "self" (o próprio olheiro), o botão "Editar dados" deixa de mandar para `/perfil` e passa a ligar o **modo de edição na própria página**: cada bloco vira formulário no lugar, com "Salvar" e "Cancelar" fixos no rodapé. Fora do modo de edição, e para visitantes (atleta/clube), a página fica exatamente como está hoje.

Campos vazios não aparecem para o visitante; para o dono aparecem como sugestão discreta ("Adicione suas especialidades").

## Detalhes técnicos

Banco (migração):
- Nova tabela `public.scout_profiles` com `user_id` (PK, referência ao usuário), `cargo text`, `especialidades text[]`, `posicoes text[]`, `competicoes text[]`, `experiencia jsonb` (lista `{periodo, cargo}`), `instagram text`, `linkedin text`, `whatsapp text`, `email_contato text`, `disponivel boolean default true`, `created_at`, `updated_at` + trigger `tg_set_updated_at`.
- GRANTs: `SELECT, INSERT, UPDATE, DELETE` para `authenticated`, `SELECT` para `anon`, `ALL` para `service_role`.
- RLS: leitura pública (dados profissionais, sem PII sensível além do que o olheiro escolher publicar); escrita apenas `auth.uid() = user_id`.
- Ampliar `get_olheiro_public_stats` não é necessário; os dados novos são lidos direto da tabela.

Frontend:
- `src/components/ScoutProfileView.tsx`: carregar `scout_profiles` junto do `profiles`; extrair as constantes fixas (`ESPECIALIDADES`, `POSICOES`) para catálogo de opções e usar os valores salvos na renderização; adicionar estado `editing` e formulários por bloco (só quando `variant === "self"`).
- Novo `src/components/scout/ScoutProfileEditor.tsx` com os campos, chips multi-seleção, editor de listas (competições) e de experiência, para manter o arquivo de visualização enxuto.
- Salvamento com `upsert` em `scout_profiles` + `update` em `profiles` (nome, cidade, celular, bio, avatar) usando o cliente do navegador, com validação zod (limites de tamanho, URLs de redes sociais) e toasts de sucesso/erro.
- Toggle de disponibilidade grava imediatamente no banco.

Ordem de execução: migração primeiro (aprovação separada), depois o código.
