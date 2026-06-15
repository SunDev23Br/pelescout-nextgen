## Objetivo

Criar `scripts/validate_admin_requests.py` — um script Python standalone que se conecta ao banco do Lovable Cloud e valida a regra de negócio central de **aprovação de cadastros de admin (olheiros)**: cada solicitação em `admin_requests` precisa cumprir todos os critérios obrigatórios antes que o suporte possa aprová-la.

## Regras de negócio validadas

Para cada registro em `admin_requests` com `status = 'pending'`, o script verifica:

1. **Identidade & vínculo**
   - `user_id` existe em `profiles`
   - `nome` preenchido (≥ 3 caracteres)
   - `email` em formato válido
2. **Contato**
   - `celular` contém entre 10 e 15 dígitos (após remover máscara)
3. **Idade**
   - `idade` entre 18 e 99
4. **Vínculo profissional**
   - `clube_atual` preenchido (≥ 2 caracteres)
5. **Documentos (RG)**
   - `rg_frente_path` e `rg_verso_path` preenchidos
   - Cada arquivo existe no bucket privado `admin-docs` (HEAD via Storage API)
   - Extensão em `jpg/jpeg/png/webp`
6. **Integridade**
   - Usuário ainda **não** possui role `admin` em `user_roles` (evita aprovação duplicada)
   - Não existem duas solicitações pending para o mesmo `user_id`

## Execução & saída

- Lê credenciais de env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — usa service role pois é script de auditoria server-side, fora da UI.
- Para cada solicitação, imprime `[OK]` ou `[FAIL]` com a lista de regras quebradas.
- Resumo final: total verificado, total aprovável, total com falhas.
- Exit code `0` se todas pending são aprováveis, `1` se houver inválidas (útil para CI).
- Flag opcional `--request-id <uuid>` para validar uma solicitação específica.

## Detalhes técnicos

- **Stack**: Python 3, dependências `supabase` (cliente oficial) e `python-dotenv`. Instalação documentada em comentário no topo (`pip install supabase python-dotenv`).
- **Estrutura**:
  ```text
  scripts/
    validate_admin_requests.py   # CLI principal
    README.md                    # como rodar + exemplo de output
  ```
- Funções puras `validate_request(record) -> list[str]` para facilitar reuso/teste.
- Verificação de arquivo no Storage via `supabase.storage.from_("admin-docs").create_signed_url(path, 60)` — se falhar, conta como erro.
- Sem efeitos colaterais: o script **só lê**, nunca aprova nem altera dados.

## Arquivos a criar

- `scripts/validate_admin_requests.py`
- `scripts/README.md`

Nenhum arquivo existente do app será modificado.
