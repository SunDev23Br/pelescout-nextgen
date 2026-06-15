## Causa
A função `public.has_role(uuid, app_role)` está sem permissão `EXECUTE` para os roles do Data API (`authenticated` / `anon`). Como várias policies e queries (ex.: `peneiras.db.ts`) a invocam, o Postgres responde `permission denied for function has_role` e quebra a aba Candidatos.

## Correção
Migração única concedendo execução da função:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO authenticated, anon, service_role;
```

Sem alteração de código.