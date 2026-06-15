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
          <Loader2 className="h-6 w-6 animate-spin text-[#3da9fc]" />
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
      <div
        className="min-h-screen -m-4 sm:-m-6 p-4 sm:p-8"
        style={{
          background:
            "radial-gradient(ellipse at top, #0d1e3d 0%, #050b1e 60%, #03070f 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl space-y-6 pb-8">
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Voltar"
                onClick={() => history.back()}
                className="text-white/70 hover:bg-[#3da9fc]/10 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#3da9fc]/40 bg-[#3da9fc]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7cc6ff] shadow-[0_0_20px_-5px_#3da9fc]">
                <Zap className="h-3 w-3" /> Vitrine do atleta
              </span>
            </div>
            {canStartChat && (
              <Button
                onClick={handleStartChat}
                disabled={starting}
                aria-label={`Iniciar conversa com ${profile.nome}`}
                className="bg-gradient-to-r from-[#1a5fb4] via-[#3da9fc] to-[#7cc6ff] text-white shadow-[0_0_25px_-5px_#3da9fc] hover:opacity-95"
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

          {/* TOP: Identidade + Sobre/Habilidades */}
          <div className="grid gap-6 lg:grid-cols-5">
            <section
              aria-labelledby="atleta-nome"
              className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-[#3da9fc]/15 bg-gradient-to-b from-[#0c1a36]/90 to-[#070f24]/90 p-8 backdrop-blur shadow-[0_30px_80px_-30px_rgba(61,169,252,0.35)]"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                aria-hidden
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(61,169,252,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(61,169,252,0.5) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 -m-6 rounded-full bg-[#3da9fc]/40 blur-3xl animate-pulse"
                    aria-hidden
                  />
                  <div className="relative rounded-full p-[3px] bg-gradient-to-br from-[#7cc6ff] via-[#3da9fc] to-[#1a5fb4] shadow-[0_0_50px_-2px_#3da9fc]">
                    <div className="rounded-full p-[2px] bg-[#050b1e]">
                      <AthleteAvatar
                        src={profile.avatar_url ?? undefined}
                        alt={`Foto de ${profile.nome}`}
                        className="h-44 w-44 sm:h-52 sm:w-52 border-2 border-[#3da9fc]/40"
                      />
                    </div>
                  </div>
                </div>

                <h1
                  id="atleta-nome"
                  className="mt-6 font-display text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl"
                  style={{ textShadow: "0 0 25px rgba(61,169,252,0.45)" }}
                >
                  {profile.nome}
                </h1>
                {profile.posicao && (
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.25em] text-[#7cc6ff]/80">
                    {profile.posicao}
                  </p>
                )}
                {profile.cidade && (
                  <p className="mt-1 text-xs text-white/50">📍 {profile.cidade}</p>
                )}

                <div className="mt-6 grid w-full grid-cols-4 gap-2">
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

            <section
              aria-labelledby="sobre"
              className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-[#3da9fc]/15 bg-[#0a1428]/80 p-8 backdrop-blur shadow-[0_30px_80px_-30px_rgba(61,169,252,0.35)]"
            >
              <div>
                <h2
                  id="sobre"
                  className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[#7cc6ff]"
                >
                  Sobre mim
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#3da9fc] to-transparent" />
                {profile.bio ? (
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-white/85">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="mt-4 text-sm italic text-white/40">
                    Este atleta ainda não escreveu uma bio.
                  </p>
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[#7cc6ff]">
                  Habilidades
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#3da9fc] to-transparent" />
                <ul className="mt-5 space-y-4">
                  {skills.map((s) => (
                    <li key={s.label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                          {s.label}
                        </span>
                        <span className="font-display text-xs font-bold text-[#7cc6ff]">
                          {s.value}
                        </span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-inset ring-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#1a5fb4] via-[#3da9fc] to-[#7cc6ff] shadow-[0_0_12px_#3da9fc] transition-[width] duration-[1200ms] ease-out"
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
          <div className="grid gap-6 lg:grid-cols-5">
            <section
              aria-labelledby="atleta-videos"
              className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-[#3da9fc]/15 bg-[#0a1428]/80 p-6 backdrop-blur shadow-[0_30px_80px_-30px_rgba(61,169,252,0.35)] sm:p-8"
            >
              <h2
                id="atleta-videos"
                className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[#7cc6ff]"
              >
                Vídeo em destaque
              </h2>
              <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#3da9fc] to-transparent" />
              <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-3 sm:p-4">
                <AthleteVideoGallery atletaId={atletaId} canManage={canManage} />
              </div>
            </section>

            <section
              aria-labelledby="conq"
              className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-[#3da9fc]/15 bg-[#0a1428]/80 p-6 backdrop-blur shadow-[0_30px_80px_-30px_rgba(61,169,252,0.35)] sm:p-8"
            >
              <h2
                id="conq"
                className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[#7cc6ff]"
              >
                Conquistas
              </h2>
              <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#3da9fc] to-transparent" />
              {conquistas.length === 0 ? (
                <p className="mt-5 text-sm italic text-white/40">
                  Nenhuma conquista cadastrada ainda.
                </p>
              ) : (
                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {conquistas.slice(0, 4).map((c, i) => (
                    <li
                      key={i}
                      className="group relative overflow-hidden rounded-2xl border border-[#3da9fc]/15 bg-gradient-to-br from-[#0e1f44] to-[#06112a] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#3da9fc]/50 hover:shadow-[0_15px_40px_-15px_#3da9fc]"
                    >
                      <div
                        className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#3da9fc]/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                      <Trophy className="mx-auto mb-2 h-9 w-9 text-[#7cc6ff] drop-shadow-[0_0_10px_#3da9fc]" />
                      <p className="font-display text-sm font-extrabold leading-tight text-white">
                        {c.label}
                      </p>
                      {c.sub && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/50">
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
    <div className="rounded-xl border border-[#3da9fc]/20 bg-white/[0.03] px-2 py-2.5 backdrop-blur">
      <div className="flex items-baseline justify-center gap-1">
        <span className="font-display text-lg font-extrabold text-white sm:text-xl">
          {value}
        </span>
        {suffix && (
          <span className="text-[10px] font-semibold text-white/60">{suffix}</span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#7cc6ff]/80">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
    </div>
  );
}
