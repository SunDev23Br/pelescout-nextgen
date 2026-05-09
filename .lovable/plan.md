## Objetivo
Adicionar um ícone de olho (mostrar/ocultar) em todos os campos de senha do app.

## Abordagem
Criar um componente reutilizável `PasswordInput` em `src/components/ui/password-input.tsx` que envolve o `Input` do shadcn com um botão à direita (ícones `Eye` / `EyeOff` do `lucide-react`) para alternar `type="password" | "text"`. Mantém todas as props do `Input`.

## Arquivos a alterar
1. **Criar** `src/components/ui/password-input.tsx` — componente com toggle de visibilidade, acessível (aria-label, focus ring), padding direito para acomodar o ícone.
2. **Substituir** `Input type="password"` por `PasswordInput` em:
   - `src/routes/login.tsx` (1 campo)
   - `src/routes/cadastro.tsx` (1 campo)
   - `src/routes/registro-admin.tsx` (2 campos: senha + confirmar)
   - `src/routes/registro-clube.tsx` (2 campos: senha + confirmar)
   - `src/routes/perfil.tsx` (3 campos: senha atual, nova, confirmar)

## Detalhes
- Cada campo tem seu próprio estado de visibilidade (independente).
- Visual coerente com o design system existente (mesma altura/borda do `Input`).
- Sem mudanças de lógica/validação — apenas UI.