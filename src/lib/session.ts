import { useEffect, useState } from "react";

export type Role = "atleta" | "admin";

export interface SessionUser {
  nome: string;
  email: string;
  role: Role;
}

const KEY = "png_session";

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("png-session"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("png-session"));
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSession());
    setReady(true);
    const onChange = () => setUser(getSession());
    window.addEventListener("png-session", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("png-session", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { user, ready };
}
