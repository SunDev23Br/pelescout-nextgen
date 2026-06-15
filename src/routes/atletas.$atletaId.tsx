import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Footprints,
  Loader2,
  MessageSquarePlus,
  Ruler,
  Star,
  Trophy,
  Weight,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteVideoGallery } from "@/components/AthleteVideoGallery";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { getUltimaAvaliacaoAtleta } from "@/lib/avaliacoes";
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
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

function AthleteProfilePage() {
  const { atletaId } = Route.useParams();
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const [notaGeral, setNotaGeral] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUltimaAvaliacaoAtleta(atletaId)
      .then((r) => {
        if (!cancelled) setNotaGeral(r?.notaGeral ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

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
            historico_clubes:
              (data.historico_clubes as ClubeHistorico[] | null) ?? [],
            stats: (data.stats as AthleteStats | null) ?? {},
          } as AthleteProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
        requestAnimationFrame(() => setAnimateBars(true));
      });
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  const canManage = user?.id === atletaId && user?.role === "atleta";
  const canStartChat =
    !!user &&
    user.id !== atletaId &&
    (user.role === "admin" || user.role === "clube");

  const skills = useMemo(() => {
    const s = profile?.stats ?? {};
    const cap = (n: number, max: number) =>
      Math.min(100, Math.round((n / max) * 100));
    const base = s.jogos != null ? cap(s.jogos, 100) : 70;
    return [
      { label: "Marcação", value: Math.min(100, base + 10) },
      { label: "Força", value: Math.max(40, base - 5) },
      { label: "Passe", value: s.assistencias != null ? cap(s.assistencias, 25) : 75 },
      { label: "Velocidade", value: Math.max(50, base) },
      { label: "Posicionamento", value: s.gols != null ? Math.min(100, cap(s.gols, 30) + 30) : 80 },
    ];
  }, [profile]);

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
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl py-12 text-center">
          <p className="text-muted-foreground">Perfil não encontrado.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const idade = calcIdade(profile.data_nascimento);

  const conquistas: { label: string; sub?: string }[] = [];
  if (profile.stats.titulos)
    conquistas.push({
      label: "Campeão",
      sub: `${profile.stats.titulos} título${profile.stats.titulos > 1 ? "s" : ""}`,
    });
  if (profile.stats.gols)
    conquistas.push({ label: `${profile.stats.gols} Gols`, sub: "Marcados" });
  if (profile.stats.assistencias)
    conquistas.push({
      label: `${profile.stats.assistencias} Assistências`,
      sub: "Visão de jogo",
    });
  if (profile.stats.jogos)
    conquistas.push({ label: `${profile.stats.jogos} Jogos`, sub: "Disputados" });
  (profile.historico_clubes ?? []).slice(0, 2).forEach((c) =>
    conquistas.push({ label: c.clube, sub: c.periodo ?? "Passagem" }),
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-8">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3 w-3" /> Vitrine do atleta
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              {profile.nome}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.posicao ?? "Atleta"}
              {profile.cidade ? ` · ${profile.cidade}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {notaGeral != null && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                  Nota geral
                </p>
                <p className="font-display text-2xl font-extrabold text-gradient-gold leading-none">
                  {notaGeral.toFixed(1)}
                </p>
              </div>
            )}
            {canStartChat && (
              <Button
                onClick={handleStartChat}
                disabled={starting}
                aria-label={`Iniciar conversa com ${profile.nome}`}
              >
                {starting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                )}
                Iniciar conversa
              </Button>
            )}
          </div>
        </div>

        {/* TOP: Perfil + Sobre/Habilidades */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* COLUNA ESQUERDA: Identidade */}
          <section
            aria-labelledby="atleta-nome"
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="rounded-full p-[3px] bg-gradient-to-br from-primary/60 via-primary to-primary/40 shadow-card">
                  <AthleteAvatar
                    src={profile.avatar_url ?? undefined}
                    alt={profile.nome}
                    className="h-36 w-36 sm:h-44 sm:w-44 border-2 border-background"
                  />
                </div>
              </div>

              <h2
                id="atleta-nome"
                className="mt-5 font-display text-2xl font-extrabold uppercase tracking-tight"
              >
                {profile.nome}
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {profile.posicao ?? "Atleta"}
              </p>

              {/* Quick stats */}
              <div className="mt-5 grid w-full grid-cols-4 gap-2">
                <QuickStat
                  icon={Star}
                  label="Idade"
                  value={idade != null ? `${idade}` : "—"}
                  suffix={idade != null ? "anos" : undefined}
                />
                <QuickStat
                  icon={Ruler}
                  label="Altura"
                  value={
                    profile.altura
                      ? (profile.altura / 100).toFixed(2).replace(".", ",")
                      : "—"
                  }
                  suffix={profile.altura ? "m" : undefined}
                />
                <QuickStat
                  icon={Weight}
                  label="Peso"
                  value={profile.peso ? `${profile.peso}` : "—"}
                  suffix={profile.peso ? "kg" : undefined}
                />
                <QuickStat
                  icon={Footprints}
                  label="Pé"
                  value={profile.pe ?? "—"}
                />
              </div>
            </div>
          </section>

          {/* COLUNA DIREITA: Sobre + Habilidades */}
          <section
            aria-labelledby="sobre"
            className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div>
              <h2
                id="sobre"
                className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary"
              >
                Sobre mim
              </h2>
              <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              {profile.bio ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-4 text-sm italic text-muted-foreground">
                  Este atleta ainda não escreveu uma bio.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Habilidades
              </h2>
              <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <ul className="mt-4 space-y-3">
                {skills.map((s) => (
                  <li key={s.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        {s.label}
                      </span>
                      <span className="font-display text-xs font-bold text-primary">
                        {s.value}
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-bg3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary transition-[width] duration-[1200ms] ease-out"
                        style={{ width: animateBars ? `${s.value}%` : "0%" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* BOTTOM: Vídeo + Conquistas */}
        <div className="grid gap-4 lg:grid-cols-5">
          <section
            aria-labelledby="videos"
            className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h2
              id="videos"
              className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary"
            >
              Vídeo em destaque
            </h2>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <div className="mt-4 rounded-xl border border-border bg-bg2 p-3">
              <AthleteVideoGallery atletaId={atletaId} canManage={canManage} />
            </div>
          </section>

          <section
            aria-labelledby="conq"
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h2
              id="conq"
              className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary"
            >
              Conquistas
            </h2>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            {conquistas.length === 0 ? (
              <p className="mt-4 text-sm italic text-muted-foreground">
                Nenhuma conquista cadastrada ainda.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {conquistas.slice(0, 4).map((c, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border bg-bg2 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                  >
                    <Trophy className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="font-display text-sm font-extrabold leading-tight">
                      {c.label}
                    </p>
                    {c.sub && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.sub}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg2 px-2 py-2.5">
      <div className="flex items-baseline justify-center gap-1">
        <span className="font-display text-lg font-extrabold sm:text-xl">
          {value}
        </span>
        {suffix && (
          <span className="text-[10px] font-semibold text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
    </div>
  );
}
