# Remover modo "Sistema" do toggle de tema

## Contexto
O usuário pediu para remover a opção "Sistema" do seletor de tema, pois a considera redundante com o modo escuro. Atualmente a plataforma tem três modos: Claro, Escuro e Sistema.

## Mudanças necessárias

1. **`src/lib/theme.tsx`**
   - Alterar o tipo `Theme` de `"light" | "dark" | "system"` para `"light" | "dark"`.
   - Remover a função `getSystemTheme()` e a lógica de `prefers-color-scheme`.
   - Simplificar o `ThemeProvider` para alternar apenas entre claro e escuro.
   - Atualizar o `THEME_INIT_SCRIPT` para tratar `"system"` legado como `"dark"`, evitando que usuários que tinham "sistema" salvo fiquem sem tema.

2. **`src/components/ThemeToggle.tsx`**
   - Remover o item "Sistema" do menu e o ícone `Monitor`.
   - Remover a importação do `Monitor` do lucide-react.

3. **Verificação**
   - Confirmar que nenhum outro lugar do código usa `setTheme("system")` ou depende do tema "system".
   - Garantir que o toggle funcione normalmente entre Claro e Escuro.
