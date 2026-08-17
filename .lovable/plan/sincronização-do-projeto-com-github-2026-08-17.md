# Sincronização do projeto com GitHub

## Objetivo
Conectar o projeto **Pelé Next Gen** ao GitHub em uma sincronização automática em duas vias: cada alteração publicada no Lovable será enviada automaticamente para o repositório, e mudanças feitas diretamente no GitHub também serão refletidas no Lovable.

## Detalhes definidos
- **Tipo de sincronização:** automática em duas vias (bidirecional).
- **Conta:** conta do GitHub já existente.
- **Nome do repositório:** `Pele-Next-Gen` (GitHub não aceita acentos em nomes de repositório; usaremos `Pele-Next-Gen` ou `pele-next-gen`).

## Passos para ativar a sincronização

1. **Abrir o menu de conexões no Lovable editor**
   - No editor, clique no botão **+ (Plus)** no campo de chat (canto inferior esquerdo).
   - Selecione **GitHub** → **Connect project**.

2. **Autorizar o Lovable GitHub App**
   - Você será redirecionado ao GitHub para autorizar o app Lovable.
   - Aprove as permissões solicitadas.

3. **Escolher a conta ou organização**
   - Após a autorização, selecione sua conta pessoal ou a organização desejada no GitHub.

4. **Criar o repositório**
   - Na interface do Lovable, clique em **Create Repository**.
   - O nome sugerido será algo como `Pele-Next-Gen` ou `pele-next-gen` (sem acentos).
   - O Lovable criará o repositório e enviará o código atual automaticamente.

5. **Confirmar a sincronização em duas vias**
   - Após a conexão, as alterações publicadas no Lovable serão enviadas automaticamente para o GitHub.
   - Alterações feitas no GitHub (via web ou git push) também serão sincronizadas de volta ao Lovable.

## Recomendações importantes

- **Branch padrão:** mantenha o branch padrão (`main`) como principal.
- **Variáveis de ambiente:** variáveis como chaves de API, tokens de conexão e credenciais do Supabase **não** são sincronizadas no repositório. Elas continuam sendo gerenciadas pelo Lovable Cloud e pelas configurações do host escolhido.
- **Se quiser usar branches:** ative a funcionalidade experimental em Account Settings → Labs → GitHub Branch Switching.
- **Apenas uma conta:** o Lovable permite conectar apenas uma conta do GitHub por usuário do Lovable. Se precisar trocar, desconecte a atual antes.

## Após a conexão

- O código estará disponível no GitHub para clone, pull requests, CI/CD com GitHub Actions e deploy externo.
- Para hospedar o app fora do Lovable, configure as variáveis de ambiente no host escolhido (Vercel, Cloudflare, etc.) manualmente.
