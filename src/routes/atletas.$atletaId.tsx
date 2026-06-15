import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MessageSquarePlus, Trophy } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteVideoGallery } from "@/components/AthleteVideoGallery";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { toast } from "sonner";

export const Route = createFileRoute("/atletas/$atletaId")({
  head: ({ params }) => {
    const url = `https://pelescout-nextgen.lovable.app/atletas/${params.atletaId}`;
    const title = "Perfil do atleta — Pelé Next Gen";
    const description =
      "Perfil completo do atleta na Pelé Next Gen: posição, estatísticas, histórico de clubes e vídeos de destaque.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url,
            mainEntity: { "@type": "Person", url },
          }),
        },
      ],
    };
  },
  component: AthleteProfilePage,
});

interface ClubeHistorico {
  clube: string;
  periodo?: string;
  descricao?: string;
}

interface AthleteStats {
  jogos?: number;
  gols?: number;
  assistencias?: number;
  titulos?: number;
}

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
  bio: string | null;
  historico_clubes: ClubeHistorico[];
  stats: AthleteStats;
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
      .select(
        "id, nome, avatar_url, posicao, cidade, altura, peso, pe, data_nascimento, bio, historico_clubes, stats",
      )
      .eq("id", atletaId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message);
        if (data) {
          setProfile({
            ...data,
            historico_clubes: (data.historico_clubes as ClubeHistorico[] | null) ?? [],
            stats: (data.stats as AthleteStats | null) ?? {},
          } as AthleteProfile);
        } else {
          setProfile(null);
        }
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
  const stats = profile.stats ?? {};
  const hasStats =
    stats.jogos != null ||
    stats.gols != null ||
    stats.assistencias != null ||
    stats.titulos != null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Voltar para a página anterior"
            onClick={() => history.back()}
            className="min-h-11"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>



        <section
          aria-labelledby="atleta-nome"
          className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-start sm:p-8 sm:text-left"
        >
          <AthleteAvatar
            src={profile.avatar_url ?? undefined}
            alt={`Foto de ${profile.nome}`}
            className="h-28 w-28 border-2 border-primary/40 shadow-card"
          />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h1
              id="atleta-nome"
              className="font-display text-2xl font-extrabold sm:text-3xl"
            >
              {profile.nome}
            </h1>
            <ul
              aria-label="Dados do atleta"
              className="flex flex-wrap justify-center gap-2 text-xs sm:justify-start"
            >
              {profile.posicao && (
                <li className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-primary">
                  {profile.posicao}
                </li>
              )}
              {profile.cidade && (
                <li className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {profile.cidade}
                </li>
              )}
              {idade !== null && (
                <li className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {idade} anos
                </li>
              )}
              {profile.altura && (
                <li className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {profile.altura} cm
                </li>
              )}
              {profile.peso && (
                <li className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  {profile.peso} kg
                </li>
              )}
              {profile.pe && (
                <li className="rounded-full bg-bg3 px-3 py-1 text-muted-foreground">
                  Pé {profile.pe}
                </li>
              )}
            </ul>
            {canStartChat && (
              <div className="pt-3">
                <Button
                  onClick={handleStartChat}
                  disabled={starting}
                  aria-label={`Iniciar conversa com ${profile.nome}`}
                  className="min-h-11"
                >
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

        {profile.bio && (
          <section
            aria-labelledby="atleta-bio"
            className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <h2 id="atleta-bio" className="mb-3 font-display text-lg font-bold">
              Sobre
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
              {profile.bio}
            </p>
          </section>
        )}

        {hasStats && (
          <section
            aria-labelledby="atleta-stats"
            className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <h2 id="atleta-stats" className="mb-4 font-display text-lg font-bold">
              Estatísticas
            </h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatBox label="Jogos" value={stats.jogos} />
              <StatBox label="Gols" value={stats.gols} />
              <StatBox label="Assistências" value={stats.assistencias} />
              <StatBox label="Títulos" value={stats.titulos} />
            </dl>
          </section>
        )}

        {profile.historico_clubes && profile.historico_clubes.length > 0 && (
          <section
            aria-labelledby="atleta-historico"
            className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <h2
              id="atleta-historico"
              className="mb-4 flex items-center gap-2 font-display text-lg font-bold"
            >
              <Trophy className="h-5 w-5 text-primary" aria-hidden /> Histórico de clubes
            </h2>
            <ol className="space-y-3">
              {profile.historico_clubes.map((c, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-border bg-bg2 p-4"
                >
                  <p className="font-bold">{c.clube}</p>
                  {c.periodo && (
                    <p className="text-xs text-muted-foreground">{c.periodo}</p>
                  )}
                  {c.descricao && (
                    <p className="mt-1 text-sm text-foreground/90">{c.descricao}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section
          aria-labelledby="atleta-videos"
          className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <AthleteVideoGallery
            atletaId={atletaId}
            canManage={canManage}
          />
        </section>
      </div>
    </AppLayout>
  );
}

function StatBox({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-2xl border border-border bg-bg2 p-4 text-center">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-extrabold text-gradient-gold">
        {value ?? "—"}
      </dd>
    </div>
  );
}
