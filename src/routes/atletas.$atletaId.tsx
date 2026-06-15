import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageSquarePlus,
  Trophy,
  User as UserIcon,
  Star,
  Video as VideoIcon,
  Image as ImageIcon,
  Mail,
  Play,
  Ruler,
  Weight,
  Footprints,
  CalendarDays,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteVideoGallery } from "@/components/AthleteVideoGallery";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { listAthleteVideos, type AthleteVideo } from "@/lib/athlete-videos";
import { ChatMedia } from "@/components/chat/ChatMedia";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/atletas/$atletaId")({
  head: () => ({
    meta: [
      { title: "Perfil do atleta — Pelé Next Gen" },
      { name: "description", content: "Veja o perfil completo e os vídeos do atleta." },
    ],
  }),
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
  skills?: Partial<Record<SkillKey, number>>;
  conquistas?: { titulo: string; ano?: string | number }[];
}

type SkillKey = "marcacao" | "forca" | "passe" | "velocidade" | "posicionamento";

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
  email: string | null;
  celular: string | null;
  historico_clubes: ClubeHistorico[];
  stats: AthleteStats;
}

const SKILL_LABELS: Record<SkillKey, string> = {
  marcacao: "Marcação",
  forca: "Força",
  passe: "Passe",
  velocidade: "Velocidade",
  posicionamento: "Posicionamento",
};

function defaultSkillsFor(posicao: string | null): Record<SkillKey, number> {
  const p = (posicao ?? "").toLowerCase();
  if (p.includes("goleiro"))
    return { marcacao: 75, forca: 78, passe: 65, velocidade: 60, posicionamento: 88 };
  if (p.includes("zag"))
    return { marcacao: 86, forca: 84, passe: 70, velocidade: 68, posicionamento: 82 };
  if (p.includes("lateral"))
    return { marcacao: 76, forca: 72, passe: 74, velocidade: 84, posicionamento: 75 };
  if (p.includes("volante"))
    return { marcacao: 84, forca: 80, passe: 78, velocidade: 72, posicionamento: 80 };
  if (p.includes("meia") || p.includes("meio"))
    return { marcacao: 68, forca: 70, passe: 86, velocidade: 76, posicionamento: 80 };
  if (p.includes("ata") || p.includes("centro") || p.includes("9"))
    return { marcacao: 55, forca: 80, passe: 72, velocidade: 86, posicionamento: 84 };
  if (p.includes("ponta") || p.includes("extremo"))
    return { marcacao: 60, forca: 68, passe: 76, velocidade: 90, posicionamento: 78 };
  return { marcacao: 72, forca: 74, passe: 74, velocidade: 76, posicionamento: 76 };
}

function calcIdade(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

const SECTIONS = [
  { id: "perfil", label: "Perfil", Icon: UserIcon },
  { id: "habilidades", label: "Habilidades", Icon: Star },
  { id: "video", label: "Vídeo de destaque", Icon: VideoIcon },
  { id: "galeria", label: "Vídeos", Icon: ImageIcon },
  { id: "conquistas", label: "Conquistas", Icon: Trophy },
  { id: "contato", label: "Contato", Icon: Mail },
] as const;

function AthleteProfilePage() {
  const { atletaId } = Route.useParams();
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [videos, setVideos] = useState<AthleteVideo[]>([]);
  const [activeSection, setActiveSection] = useState<string>("perfil");
  const skillsRef = useRef<HTMLDivElement | null>(null);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const [playFeatured, setPlayFeatured] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select(
        "id, nome, avatar_url, posicao, cidade, altura, peso, pe, data_nascimento, bio, email, celular, historico_clubes, stats",
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
    listAthleteVideos(atletaId)
      .then((v) => !cancelled && setVideos(v))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  // Skill bar animation trigger
  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSkillsVisible(true);
        });
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [profile]);

  // Scroll-spy
  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(`sec-${s.id}`)).filter(
      Boolean,
    ) as HTMLElement[];
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id.replace("sec-", ""));
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [profile]);

  const canManage = user?.id === atletaId && user?.role === "atleta";
  const canStartChat =
    !!user && user.id !== atletaId && (user.role === "admin" || user.role === "clube");

  const skills = useMemo<Record<SkillKey, number>>(() => {
    const defaults = defaultSkillsFor(profile?.posicao ?? null);
    const overrides = profile?.stats?.skills ?? {};
    return {
      marcacao: overrides.marcacao ?? defaults.marcacao,
      forca: overrides.forca ?? defaults.forca,
      passe: overrides.passe ?? defaults.passe,
      velocidade: overrides.velocidade ?? defaults.velocidade,
      posicionamento: overrides.posicionamento ?? defaults.posicionamento,
    };
  }, [profile]);

  const conquistas = useMemo(() => {
    if (profile?.stats?.conquistas && profile.stats.conquistas.length > 0) {
      return profile.stats.conquistas;
    }
    // fallback: deriva do histórico de clubes (mostra clubes como conquistas básicas)
    return (profile?.historico_clubes ?? []).map((c) => ({
      titulo: c.clube,
      ano: c.periodo,
    }));
  }, [profile]);

  const featuredVideo = videos[0] ?? null;

  async function handleStartChat() {
    if (!user) return;
    setStarting(true);
    try {
      await startConversation(atletaId);
      navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setStarting(false);
    }
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(`sec-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <div className="athlete-neon">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Voltar"
              onClick={() => history.back()}
              className="min-h-11 text-muted-foreground hover:text-[#00d4ff]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-[72px_1fr]">
            {/* Sidebar */}
            <aside className="md:sticky md:top-20 md:self-start">
              <nav
                aria-label="Seções do perfil"
                className="flex gap-2 overflow-x-auto md:flex-col md:gap-3 md:overflow-visible"
              >
                {SECTIONS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollToSection(id)}
                    title={label}
                    aria-label={label}
                    aria-current={activeSection === id ? "true" : undefined}
                    className={cn("neon-sidebar-item shrink-0", activeSection === id && "active")}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main */}
            <div className="space-y-6">
              {/* HERO */}
              <section
                id="sec-perfil"
                aria-labelledby="atleta-nome"
                className="neon-card relative overflow-hidden p-6 sm:p-10"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)",
                  }}
                />
                <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
                  <div className="relative">
                    <div className="rounded-full glow-neon">
                      <AthleteAvatar
                        src={profile.avatar_url ?? undefined}
                        alt={`Foto de ${profile.nome}`}
                        className="h-36 w-36 border-2 border-[#00d4ff]/60 sm:h-44 sm:w-44"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <h1
                      id="atleta-nome"
                      className="font-display text-3xl font-extrabold uppercase tracking-[0.08em] text-white text-glow sm:text-4xl"
                    >
                      {profile.nome}
                    </h1>
                    {profile.posicao && (
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00d4ff]">
                        {profile.posicao}
                      </p>
                    )}
                    <ul
                      aria-label="Dados do atleta"
                      className="flex flex-wrap justify-center gap-3 text-xs text-slate-300 sm:justify-start"
                    >
                      {idade !== null && (
                        <li className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-[#00d4ff]" />
                          {idade} anos
                        </li>
                      )}
                      {profile.altura && (
                        <li className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Ruler className="h-3.5 w-3.5 text-[#00d4ff]" />
                          {profile.altura} cm
                        </li>
                      )}
                      {profile.peso && (
                        <li className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Weight className="h-3.5 w-3.5 text-[#00d4ff]" />
                          {profile.peso} kg
                        </li>
                      )}
                      {profile.pe && (
                        <li className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Footprints className="h-3.5 w-3.5 text-[#00d4ff]" />
                          Pé {profile.pe}
                        </li>
                      )}
                      {profile.cidade && (
                        <li className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          {profile.cidade}
                        </li>
                      )}
                    </ul>
                    {canStartChat && (
                      <div className="pt-2">
                        <Button
                          onClick={handleStartChat}
                          disabled={starting}
                          className="min-h-11 border-0 bg-gradient-to-r from-[#00d4ff] to-[#1e3a8a] text-[#0a0f1c] hover:opacity-90"
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
                </div>
              </section>

              {/* SOBRE MIM */}
              {profile.bio && (
                <section
                  aria-labelledby="sobre-mim"
                  className="neon-card p-6 sm:p-8"
                >
                  <h2
                    id="sobre-mim"
                    className="mb-3 font-display text-lg font-bold uppercase tracking-wider text-white"
                  >
                    <span className="text-[#00d4ff]">//</span> Sobre mim
                  </h2>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-200">
                    {profile.bio}
                  </p>
                </section>
              )}

              {/* HABILIDADES */}
              <section
                id="sec-habilidades"
                ref={skillsRef}
                aria-labelledby="habilidades"
                className="neon-card p-6 sm:p-8"
              >
                <h2
                  id="habilidades"
                  className="mb-6 font-display text-lg font-bold uppercase tracking-wider text-white"
                >
                  <span className="text-[#00d4ff]">//</span> Habilidades
                </h2>
                <div className="space-y-5">
                  {(Object.keys(SKILL_LABELS) as SkillKey[]).map((k) => (
                    <div key={k}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold uppercase tracking-wider text-slate-200">
                          {SKILL_LABELS[k]}
                        </span>
                        <span className="font-mono text-[#00d4ff]">{skills[k]}</span>
                      </div>
                      <div className="skill-track">
                        <div
                          className={cn("skill-fill", skillsVisible && "animate")}
                          style={{ ["--skill-value" as string]: `${skills[k]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* VÍDEO DE DESTAQUE */}
              <section
                id="sec-video"
                aria-labelledby="video-destaque"
                className="neon-card p-6 sm:p-8"
              >
                <h2
                  id="video-destaque"
                  className="mb-5 font-display text-lg font-bold uppercase tracking-wider text-white"
                >
                  <span className="text-[#00d4ff]">//</span> Vídeo de destaque
                </h2>
                {featuredVideo ? (
                  playFeatured ? (
                    <div className="overflow-hidden rounded-2xl">
                      <ChatMedia
                        bucket="athlete-videos"
                        path={featuredVideo.path}
                        mime={featuredVideo.mime}
                        kind="video"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayFeatured(true)}
                      aria-label="Reproduzir vídeo de destaque"
                      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-[#00d4ff]/30 bg-gradient-to-br from-[#0a0f1c] via-[#0f172a] to-[#1e3a8a]/40"
                    >
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                        style={{
                          background:
                            "radial-gradient(circle at center, rgba(0,212,255,0.3), transparent 60%)",
                        }}
                      />
                      <div className="play-button relative">
                        <Play className="h-7 w-7 fill-current" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <p className="text-sm font-semibold text-white">
                          {featuredVideo.titulo ?? "Vídeo de destaque"}
                        </p>
                      </div>
                    </button>
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
                    Nenhum vídeo enviado ainda.
                  </div>
                )}
              </section>

              {/* GALERIA DE VÍDEOS */}
              <section
                id="sec-galeria"
                aria-labelledby="galeria-videos"
                className="neon-card p-6 sm:p-8"
              >
                <AthleteVideoGallery atletaId={atletaId} canManage={canManage} />
              </section>

              {/* CONQUISTAS */}
              <section
                id="sec-conquistas"
                aria-labelledby="conquistas-titulo"
                className="neon-card p-6 sm:p-8"
              >
                <h2
                  id="conquistas-titulo"
                  className="mb-5 font-display text-lg font-bold uppercase tracking-wider text-white"
                >
                  <span className="text-[#00d4ff]">//</span> Conquistas
                </h2>
                {conquistas.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {conquistas.map((c, i) => (
                      <div key={i} className="trophy-card flex items-center gap-3 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00d4ff]/30 to-[#1e3a8a]/40">
                          <Trophy className="h-6 w-6 text-[#00d4ff]" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{c.titulo}</p>
                          {c.ano && (
                            <p className="text-xs text-slate-400">{String(c.ano)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
                    Nenhuma conquista registrada ainda.
                  </div>
                )}
              </section>

              {/* CONTATO */}
              {(profile.email || profile.celular) && (
                <section
                  id="sec-contato"
                  aria-labelledby="contato-titulo"
                  className="neon-card p-6 sm:p-8"
                >
                  <h2
                    id="contato-titulo"
                    className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-white"
                  >
                    <span className="text-[#00d4ff]">//</span> Contato
                  </h2>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {profile.email && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          E-mail
                        </dt>
                        <dd className="mt-1 truncate text-sm text-white">{profile.email}</dd>
                      </div>
                    )}
                    {profile.celular && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Celular
                        </dt>
                        <dd className="mt-1 text-sm text-white">{profile.celular}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
