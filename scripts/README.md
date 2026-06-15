# Scripts de validação

## `validate_admin_requests.py`

Valida a regra de negócio central da plataforma: **aprovação de cadastros de
admin (olheiros)**. Para cada solicitação `pending` em `admin_requests`,
verifica nome, email, celular, idade, clube atual, documentos do RG no
bucket `admin-docs`, e impede aprovações duplicadas (usuário já admin ou
múltiplas pending para o mesmo `user_id`).

O script é **somente leitura** — não aprova nem altera nada.

### Instalação

```bash
pip install supabase python-dotenv
```

### Configuração

Defina as variáveis de ambiente (ou crie um `.env` na raiz do projeto):

```bash
export SUPABASE_URL="https://<seu-projeto>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

> A service role key é necessária para listar todas as solicitações e
> verificar arquivos no bucket privado. Use apenas em ambiente seguro
> (terminal local, CI). Nunca commitar.

### Uso

```bash
# Validar todas as solicitações pending
python scripts/validate_admin_requests.py

# Validar uma solicitação específica
python scripts/validate_admin_requests.py --request-id 0000-...-uuid
```

### Exit codes

- `0` — todas as pending estão aprováveis (ou não há nenhuma)
- `1` — pelo menos uma solicitação tem regra violada
- `2` — erro de configuração (env vars ou dependências ausentes)

### Exemplo de saída

```
Validando 3 solicitação(ões) pending...

[ OK ] 1a2b...  (joao@exemplo.com)
[FAIL] 9f8e...  (carlos@exemplo.com)
       - celular inválido (8 dígitos; esperado 10-15)
       - rg_verso_path ausente
[ OK ] 7c6d...  (ana@exemplo.com)

--- Resumo ---
Total verificado : 3
Aprováveis       : 2
Com falhas       : 1
```
