import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "atleta" | "admin" | "clube" | "suporte";

export interface SessionUser {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
  /** Apenas quando role === "clube". Lista de candidatoIds com contato desbloqueado. */
  contatosDesbloqueados?: string[];
}

/** Logout: encerra sessão Supabase. */
export async function clearSession() {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("png-selected-role");
    window.dispatchEvent(new Event("png-session"));
  }
}

/**
 * Marca um contato como desbloqueado para o clube atual (após "pagamento" simulado).
 * Insere em contatos_desbloqueados.
 */
export async function unlockContato(candidatoId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;
  await supabase
    .from("contatos_desbloqueados")
    .insert({ clube_id: userId, candidato_id: candidatoId });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("png-session"));
  }
}

async function loadSessionUser(userId: string): Promise<SessionUser | null> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("nome, email, avatar_url").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  if (!profile) return null;

  // Determine role priority: suporte > admin > clube > atleta
  const roleSet = new Set((roles ?? []).map((r) => r.role as Role));
  const selected =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("png-selected-role") as Role | null)
      : null;
  const role: Role =
    selected && roleSet.has(selected)
      ? selected
      : roleSet.has("suporte")
        ? "suporte"
        : roleSet.has("admin")
          ? "admin"
          : roleSet.has("clube")
            ? "clube"
            : "atleta";

  let contatosDesbloqueados: string[] | undefined;
  if (role === "clube") {
    const { data } = await supabase
      .from("contatos_desbloqueados")
      .select("candidato_id")
      .eq("clube_id", userId);
    contatosDesbloqueados = (data ?? []).map((d) => d.candidato_id);
  }

  return {
    id: userId,
    nome: profile.nome,
    email: profile.email,
    avatarUrl: (profile as { avatar_url?: string | null }).avatar_url ?? null,
    role,
    contatosDesbloqueados,
  };
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // CRITICAL: set up listener BEFORE getSession to avoid missing events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const uid = session?.user?.id;
      if (!uid) {
        setUser(null);
        setReady(true);
        return;
      }
      // Defer Supabase calls to avoid deadlocks inside the callback.
      setTimeout(() => {
        loadSessionUser(uid).then((u) => {
          if (mounted) {
            setUser(u);
            setReady(true);
          }
        });
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) {
        if (mounted) {
          setUser(null);
          setReady(true);
        }
        return;
      }
      loadSessionUser(uid).then((u) => {
        if (mounted) {
          setUser(u);
          setReady(true);
        }
      });
    });

    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) {
        setUser(null);
        return;
      }
      const u = await loadSessionUser(uid);
      if (mounted) setUser(u);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("png-session", refresh);
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("png-session", refresh);
      }
    };
  }, []);

  return { user, ready };
}
