# Manual do Usuário — plano

Criar um único arquivo Markdown navegável com índice por papel (Atleta, Olheiro/Admin, Clube, Suporte), e referenciá-lo no README.

## Arquivos

1. **`docs/manual-do-usuario.md`** (novo)
   - Cabeçalho + sumário com âncoras para cada seção.
   - Seção "Como usar este manual" (papéis, login, navegação geral).
   - **Atleta**: cadastro (`/cadastro`), completar perfil (`/perfil-atleta`), explorar peneiras (`/peneiras`), inscrever-se, acompanhar avaliações (`/avaliacoes`), chat (`/chat`), conectar wearables.
   - **Olheiro / Admin**: registro (`/registro-admin` + aprovação do suporte), dashboard (`/dashboard`), criar peneira (`/peneiras/criar`), gerenciar candidatos (`/candidatos`), avaliar atleta (`/candidatos/$id`), chat.
   - **Clube**: registro (`/registro-clube` + aprovação), aba clubes (`/clubes`) listando atletas aprovados, liberar contato (pagamento), iniciar chat.
   - **Suporte**: painel (`/suporte`), aprovar admins/clubes, gerenciar papéis (`user_roles`), boas práticas de segurança.
   - **FAQ / Solução de problemas** curto (login, esqueci senha, contato bloqueado, áudio do TTS).
   - **Glossário** (peneira, candidato, avaliação, olheiro, etc.).
   - Cada seção usa passos numerados, blocos `> Dica`, e referências aos caminhos reais das rotas para o leitor reproduzir.

2. **`README.md`** (edição mínima)
   - Adicionar bullet em uma seção apropriada (ex.: topo de "Funcionalidades" ou nova subseção "Documentação"):
     `📘 Manual do usuário: [docs/manual-do-usuario.md](docs/manual-do-usuario.md)`.

## Fora de escopo

- Nenhuma rota nova, nenhum componente React, nenhuma migração.
- Sem screenshots/GIFs (pode ser adicionado depois pelo usuário na aba docs dele).
- Sem alterações de lógica de negócio.
