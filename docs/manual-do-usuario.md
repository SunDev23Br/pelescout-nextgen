# 📘 Manual do Usuário — Pelé Next Gen

Bem-vindo(a) ao **Pelé Next Gen**, a plataforma oficial de peneiras de futebol que conecta **atletas**, **olheiros** e **clubes** em todo o Brasil.

Este manual é dividido por **papel de usuário**. Vá direto à seção que corresponde ao seu perfil.

---

## Sumário

- [Como usar este manual](#como-usar-este-manual)
- [👟 Atleta](#-atleta)
- [🔍 Olheiro / Admin](#-olheiro--admin)
- [🏟️ Clube](#-clube)
- [🛠️ Suporte](#-suporte)
- [❓ FAQ / Solução de problemas](#-faq--solução-de-problemas)
- [📖 Glossário](#-glossário)

---

## Como usar este manual

O Pelé Next Gen possui quatro tipos de usuário, cada um com sua própria jornada:

| Papel | O que faz | Como entra |
|-------|-----------|------------|
| **Atleta** | Cria perfil, se inscreve em peneiras, recebe avaliações | Cadastro aberto em `/cadastro` |
| **Olheiro (Admin)** | Cria peneiras, avalia candidatos | Solicita acesso em `/registro-admin` → aprovado pelo Suporte |
| **Clube** | Busca atletas aprovados e libera contatos | Solicita acesso em `/registro-clube` → aprovado pelo Suporte |
| **Suporte** | Aprova admins/clubes e gerencia papéis | Acesso restrito (definido internamente) |

**Login único** em [`/login`](../src/routes/login.tsx). Após autenticar, você é redirecionado para a área correspondente ao seu papel. Para ouvir o conteúdo da página, clique no botão **🔊 Ouvir página** disponível na tela de login (recurso de acessibilidade — leitor de tela TTS).

> 💡 **Dica:** todos os caminhos entre crases (ex.: `/peneiras`) são rotas reais do app. Cole-os após o domínio para navegar diretamente.

---

## 👟 Atleta

Você é jogador(a) e quer ser visto por olheiros e clubes.

### 1. Crie sua conta

1. Acesse **`/cadastro`**.
2. Preencha nome, e-mail, senha, data de nascimento, posição preferida e cidade/estado.
3. Confirme o e-mail (link enviado para sua caixa de entrada).

### 2. Complete seu perfil de atleta

1. Após o login, vá em **`/perfil-atleta`**.
2. Adicione:
   - Foto de perfil (avatar)
   - Altura, peso, pé dominante
   - Vídeos de jogadas e treinos (galeria de vídeos)
   - Histórico esportivo
3. Quanto mais completo o perfil, maior a chance de ser notado.

> 💡 **Dica:** vídeos curtos (até 60s) com boa iluminação convertem muito mais.

### 3. Conecte seus wearables (opcional)

Em **`/perfil-atleta`** → seção **Wearables**, conecte dispositivos compatíveis para enviar automaticamente métricas físicas (distância percorrida, frequência cardíaca, sprints).

### 4. Encontre e se inscreva em peneiras

1. Acesse **`/peneiras`**.
2. Use os filtros (cidade, data, categoria, posição) para achar seletivas próximas.
3. Clique em uma peneira → leia os requisitos → **Inscrever-se**.
4. Sua inscrição vira um *candidato* visível para o olheiro responsável.

### 5. Acompanhe suas avaliações

- Em **`/avaliacoes`** você vê todas as notas e comentários recebidos após cada peneira.
- O **olheiro** define se você foi **aprovado**, **reprovado** ou ficou em **observação**.
- Atletas **aprovados** passam a aparecer automaticamente para clubes na aba `/clubes`.

### 6. Converse no chat

- Em **`/chat`** você troca mensagens com olheiros e clubes que liberaram seu contato.
- Notificações aparecem no ícone do menu principal.

### 7. Boas práticas

- Mantenha o perfil atualizado a cada temporada.
- Responda mensagens rapidamente — clubes pagam para falar com você.
- Leia o **[Manual de Peneiras](../src/routes/manual.tsx)** para se preparar melhor para o dia da seletiva.

---

## 🔍 Olheiro / Admin

Você é olheiro(a), avaliador(a) técnico(a) ou organizador(a) de peneiras.

### 1. Solicite acesso

1. Acesse **`/registro-admin`**.
2. Preencha dados profissionais (nome, CPF, clube/entidade vinculada, e-mail).
3. Aguarde a aprovação do **Suporte** (você recebe um e-mail quando aprovado).

### 2. Dashboard

Em **`/dashboard`** você visualiza:
- Total de peneiras criadas
- Candidatos pendentes de avaliação
- Estatísticas de aprovações
- Atalhos rápidos para as ações mais usadas

### 3. Crie uma peneira

1. Vá em **`/peneiras/criar`**.
2. Defina: título, descrição, data, local, vagas, categorias e posições alvo.
3. Publique. A peneira aparece imediatamente em `/peneiras` para os atletas.

### 4. Gerencie candidatos

1. Em **`/candidatos`** você lista todos os inscritos das suas peneiras.
2. Filtre por peneira, status, posição ou cidade.
3. Clique em um candidato (`/candidatos/$candidatoId`) para ver perfil completo, vídeos e métricas de wearables.

### 5. Avalie um atleta

Dentro do candidato, use os cards de avaliação:
- **Notas rápidas** (1–10) por dimensão técnica/física/mental
- **Tags** para destacar pontos fortes/fracos
- **Comentário do olheiro** (texto livre)
- **Decisão final**: aprovado / reprovado / observação
- O **Resumo automático** e o **Radar** consolidam a avaliação.

Atletas aprovados ficam visíveis para clubes em `/clubes`.

### 6. Chat com candidatos

- Use **`/chat`** para combinar detalhes (presença, documentos, contato direto).

> 💡 **Dica:** seja objetivo nos comentários — o atleta recebe e lê tudo em `/avaliacoes`.

---

## 🏟️ Clube

Você representa um clube ou entidade esportiva em busca de talentos.

### 1. Solicite acesso

1. Acesse **`/registro-clube`**.
2. Informe razão social, CNPJ, responsável, e-mail institucional e cidade/estado.
3. Aguarde aprovação do **Suporte**.

### 2. Encontre atletas aprovados

1. Vá em **`/clubes`**.
2. Você vê **todos os atletas aprovados** pelos olheiros, com:
   - Nome, posição, cidade, idade
   - Avatar e nota geral
   - Peneira de origem
3. Use a busca/filtros para refinar.

### 3. Libere o contato (pagamento)

- Os campos **e-mail** e **celular** aparecem como `•••••• oculto ••••••`.
- Clique em **Liberar contato — R$ X,XX** para pagar e desbloquear permanentemente os dados daquele atleta.
- O desbloqueio é por atleta, válido para todo o clube.

### 4. Inicie a conversa

- Após liberar, o botão **Enviar mensagem** abre uma conversa em `/chat` com o atleta.
- E-mail e telefone também ficam visíveis no card.

> 💡 **Dica:** combine a proposta inicial pelo chat antes de ligar — atletas jovens preferem mensagens.

---

## 🛠️ Suporte

Você faz parte da equipe técnica/operacional do Pelé Next Gen.

### 1. Painel de suporte

Acesse **`/suporte`** (requer papel `suporte`).

### 2. Aprove cadastros de admin e clube

- Liste solicitações pendentes (admins em `/registro-admin`, clubes em `/registro-clube`).
- Verifique documentos enviados.
- **Aprove** ou **Recuse**. Aprovação cria o papel correspondente em `user_roles`.

### 3. Gerencie papéis

- Em `/usuarios/$userId` você visualiza qualquer usuário.
- Pode atribuir/remover papéis (`atleta`, `admin`, `clube`, `suporte`).
- Hierarquia: `suporte` > `admin` > `clube` > `atleta`.

### 4. Boas práticas de segurança

- Nunca aprove um cadastro sem checar CPF/CNPJ.
- Papéis são armazenados em tabela separada (`user_roles`) — **nunca** edite via JS no navegador.
- Use o script `scripts/validate_admin_requests.py` para auditar pendências em lote.
- Acesse logs e métricas pelo backend (Lovable Cloud).

---

## ❓ FAQ / Solução de problemas

**Não recebi o e-mail de confirmação.**
Verifique spam/lixeira. Se persistir, use **Esqueci minha senha** em `/login` ou peça reenvio ao suporte.

**Esqueci minha senha.**
Em `/login` clique em **Esqueci minha senha** e siga o link enviado por e-mail.

**Sou clube e o atleta não aparece em `/clubes`.**
Só atletas com avaliação **aprovado** por algum olheiro aparecem. Se acabou de ser aprovado, atualize a página.

**Paguei pelo contato mas continua oculto.**
Aguarde alguns segundos e atualize. Se persistir, abra um ticket — o desbloqueio fica registrado no servidor.

**O botão "Ouvir página" não toca áudio.**
Verifique o volume do dispositivo e se o navegador permite reprodução automática de áudio. O recurso usa TTS via gateway de IA — pode levar 1–2 segundos para começar.

**Sou admin/clube e meu cadastro está "pendente" há dias.**
Entre em contato com o suporte: aprovações são manuais e podem levar até 48h úteis.

---

## 📖 Glossário

- **Peneira** — Seletiva esportiva organizada por um olheiro/clube para avaliar atletas.
- **Candidato** — Atleta inscrito em uma peneira específica.
- **Avaliação** — Conjunto de notas, tags e comentários atribuídos por um olheiro a um candidato.
- **Olheiro (Admin)** — Profissional que cria peneiras e avalia atletas.
- **Clube** — Entidade que busca atletas aprovados para contratação.
- **Aprovado** — Status da avaliação que torna o atleta visível para clubes.
- **Liberar contato** — Pagamento feito pelo clube para desbloquear e-mail/telefone de um atleta.
- **Wearable** — Dispositivo vestível (relógio, faixa cardíaca) que envia métricas físicas ao perfil do atleta.
- **TTS (Text-to-Speech)** — Recurso de acessibilidade que lê o conteúdo da tela em voz alta.

---

_Última atualização: junho de 2026. Sugestões e correções: abra uma issue ou contate o suporte._
