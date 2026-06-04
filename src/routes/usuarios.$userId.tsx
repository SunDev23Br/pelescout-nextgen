import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Mail, MessageSquarePlus, Phone, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { toast } from "sonner";

export const Route = createFileRoute("/usuarios/$userId")({
  head: () => ({
    meta: [
      { title: "Perfil — Pelé Next Gen" },
      { name: "description", content: "Perfil público do usuário." },
    ],
  }),
  component: UserProfilePage,
});

interface UserProfile {
  id: string;
  nome: string;
  avatar_url: string | null;
  email: string | null;
  celular: string | null;
  nome_clube: string | null;
  cnpj: string | null;
}

type Role = "admin" | "clube" | "atleta" | "suporte";

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase
        .from("profiles")
        .select("id, nome, avatar_url, email, celular, nome_clube, cnpj")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]).then(([p, r]) => {
      if (cancelled) return;
      if (p.error) toast.error(p.error.message);
      setProfile((p.data as UserProfile) ?? null);
      setRoles(((r.data ?? []) as { role: Role }[]).map((x) => x.role));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isAtleta = roles.includes("atleta");
  const isClube = roles.includes("clube");
  const isAdmin = roles.includes("admin");
  const roleLabel = isAdmin ? "Olheiro" : isClube ? "Clube" : isAtleta ? "Atleta" : "Usuário";

  const canStartChat =
    !!user &&
    user.id !== userId &&
    isAtleta &&
    (user.role === "admin" || user.role === "clube");

  async function handleStartChat() {
    if (!user) return;
    setStarting(true);
    try {
      await startConversation(userId);
      navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setStarting(false);
    }
  }

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl py-12 text-center">
          <p className="text-muted-foreground">Perfil não disponível.</p>
          <Button variant="outline" className="mt-4" onClick={() => history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  // If viewing an atleta and the visitor is admin/clube, redirect to the rich athlete profile.
  if (isAtleta && (user?.role === "admin" || user?.role === "clube")) {
    navigate({ to: "/atletas/$atletaId", params: { atletaId: userId }, replace: true });
    return null;
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.back()}
          className="min-h-11"
          aria-label="Voltar"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <section className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-start sm:p-8">
          <AthleteAvatar
            src={profile.avatar_url ?? undefined}
            alt={`Foto de ${profile.nome}`}
            className="h-28 w-28 border-2 border-primary/40 shadow-card"
          />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {roleLabel}
              </p>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
                {profile.nome}
              </h1>
              {isClube && profile.nome_clube && (
                <p className="text-sm text-muted-foreground">{profile.nome_clube}</p>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              {isClube && profile.cnpj && (
                <div className="flex justify-center gap-2 sm:justify-start">
                  <dt className="font-semibold text-muted-foreground">CNPJ:</dt>
                  <dd>{profile.cnpj}</dd>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Mail className="h-4 w-4 text-primary" aria-hidden />
                  <a
                    href={`mailto:${profile.email}`}
                    className="hover:text-primary hover:underline"
                  >
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.celular && (
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Phone className="h-4 w-4 text-primary" aria-hidden />
                  <a
                    href={`tel:${profile.celular}`}
                    className="hover:text-primary hover:underline"
                  >
                    {profile.celular}
                  </a>
                </div>
              )}
            </dl>

            {canStartChat && (
              <div className="pt-2">
                <Button onClick={handleStartChat} disabled={starting} className="min-h-11">
                  {starting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                  )}
                  Iniciar conversa
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
