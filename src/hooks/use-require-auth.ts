import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Bloqueia o acesso de visitantes: sem sessão, envia para o login
 * guardando a rota pretendida para voltar depois do cadastro/login.
 */
export function useRequireAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active || data.session) return;
      const href =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/";
      navigate({ to: "/login", search: { redirect: href }, replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);
}
