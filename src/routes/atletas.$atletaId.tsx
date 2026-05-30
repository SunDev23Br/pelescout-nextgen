import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MessageSquarePlus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteVideoGallery } from "@/components/AthleteVideoGallery";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { toast } from "sonner";

export const Route = createFileRoute("/atletas/$atletaId")({
  head: () => ({
    meta: [
      { title: "Perfil do atleta — Pelé Next Gen" },
      { name: "description", content: "Veja o perfil completo e os vídeos do atleta." },
    ],
  }),
  component: AthleteProfilePage,
});

interface AthleteProfile {
  id: string;
  nome: string;
  avatar_url: string | null;
  posicao: string | null;
  cidade: string | null;
  altura: number | null;
  peso: number | null;
  pe: string | null;
  data_nascimento: string | null;
}

function calcIdade(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function AthleteProfilePage() {
  const { atletaId } = Route.useParams();
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, nome, avatar_url, posicao, cidade, altura, peso, pe, data_nascimento")
      .eq("id", atletaId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message);
        setProfile((data as AthleteProfile | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  const canManage = user?.id === atletaId && user?.role === "atleta";
  const canStartChat =
    !!user && user.id !== atletaId && (user.role === "admin" || user.role === "clube");

  async function handleStartChat() {
    if (!user) return;
    setStarting(true);
    try {
      await startConversation(atletaId);
      navigate({ to: "/chat" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(msg);
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
        <div className="mx-auto max-w-3xl py-12 text-center">
          <p className="text-muted-foreground">Perfil não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const idade = calcIdade(profile.data_nascimento);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <section className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:flex-row sm:items-start sm:p-8 sm:text-left">
          <AthleteAvatar
            src={profile.avatar_url ?? undefined}
            alt={profile.nome}
            className="h-28 w-28 border-2 border-primary/40 shadow-card"
          />
          <div className="flex-1 space-y-2">
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{profile.nome}</h1>
            <div className="flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
              {profile.posicao && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-primary">
                  {profile.posicao}
                </span>
              )}
              {profile.cidade && (
                <span className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {profile.cidade}
                </span>
              )}
              {idade !== null && (
                <span className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {idade} anos
                </span>
              )}
              {profile.altura && (
                <span className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {profile.altura} cm
                </span>
              )}
              {profile.peso && (
                <span className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {profile.peso} kg
                </span>
              )}
              {profile.pe && (
                <span className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  Pé {profile.pe}
                </span>
              )}
            </div>
            {canStartChat && (
              <div className="pt-3">
                <Button onClick={handleStartChat} disabled={starting}>
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

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <AthleteVideoGallery atletaId={atletaId} canManage={canManage} />
        </section>
      </div>
    </AppLayout>
  );
}
