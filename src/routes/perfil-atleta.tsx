import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Crown,
  Flame,
  Footprints,
  Goal,
  Loader2,
  Medal,
  Ruler,
  Settings,
  Sparkles,
  Star,
  Target,
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
import { toast } from "sonner";

export const Route = createFileRoute("/perfil-atleta")({
  head: () => ({
    meta: [
      { title: "Perfil do Atleta — Pelé Next Gen" },
      {
        name: "description",
        content: "Vitrine profissional do atleta: destaques, habilidades, vídeos e conquistas.",
      },
    ],
  }),
  component: PerfilAtletaPage,
});

interface ClubeHistorico {
  clube: string;
  periodo?: string;
  descricao?: string;
}
interface AthleteStats {
  jogos?: number | null;
  gols?: number | null;
  assistencias?: number | null;
  titulos?: number | null;
}
interface FullProfile {
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

function PerfilAtletaPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
    if (ready && user && user.role !== "atleta") navigate({ to: "/perfil" });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select(
        "id, nome, avatar_url, posicao, cidade, altura, peso, pe, data_nascimento, bio, historico_clubes, stats",
      )
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message);
        if (data) {
          setProfile({
            ...data,
            historico_clubes: (data.historico_clubes as ClubeHistorico[] | null) ?? [],
            stats: (data.stats as AthleteStats | null) ?? {},
          } as FullProfile);
        }
        setLoading(false);
        // trigger bar animation next tick
        requestAnimationFrame(() => setAnimateBars(true));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const skills = useMemo(() => {
    const s = profile?.stats ?? {};
    const cap = (n: number, max: number) => Math.min(100, Math.round((n / max) * 100));
    return [
      {
        label: "Finalização",
        value: s.gols != null ? cap(s.gols, 30) : 65,
        icon: Goal,
      },
      {
        label: "Visão de jogo",
        value: s.assistencias != null ? cap(s.assistencias, 25) : 70,
        icon: Target,
      },
      {
        label: "Experiência",
        value: s.jogos != null ? cap(s.jogos, 100) : 60,
        icon: Flame,
      },
      {
        label: "Vitórias",
        value: s.titulos != null ? cap(s.titulos, 10) : 55,
        icon: Trophy,
      },
    ];
  }, [profile]);

  if (!ready || loading || !user) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[color:var(--blue-light)]" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
          Perfil não encontrado.
        </div>
      </AppLayout>
    );
  }

  const idade = calcIdade(profile.data_nascimento);
  const overall = Math.round(
    skills.reduce((acc, s) => acc + s.value, 0) / skills.length,
  );

  const conquistas: { label: string; sub?: string; icon: React.ComponentType<{ className?: string }> }[] = [];
  if (profile.stats.titulos)
    conquistas.push({ label: `${profile.stats.titulos} título${profile.stats.titulos > 1 ? "s" : ""}`, sub: "Carreira", icon: Crown });
  if (profile.stats.gols)
    conquistas.push({ label: `${profile.stats.gols} gols`, sub: "Marcados", icon: Goal });
  if (profile.stats.assistencias)
    conquistas.push({ label: `${profile.stats.assistencias} assistências`, sub: "Visão de jogo", icon: Sparkles });
  if (profile.stats.jogos)
    conquistas.push({ label: `${profile.stats.jogos} jogos`, sub: "Disputados", icon: Medal });
  (profile.historico_clubes ?? []).slice(0, 3).forEach((c) =>
    conquistas.push({ label: c.clube, sub: c.periodo ?? "Passagem", icon: Award }),
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-8">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--blue-light)]/40 bg-[color:var(--blue)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--blue-light)] shadow-[0_0_20px_-5px_var(--blue-light)]">
            <Zap className="h-3 w-3" /> Vitrine do atleta
          </span>
          <Button asChild variant="outline" size="sm" className="border-[color:var(--blue-light)]/30 text-[color:var(--blue-light)] hover:bg-[color:var(--blue)]/10">
            <Link to="/perfil">
              <Settings className="mr-2 h-4 w-4" /> Editar dados
            </Link>
          </Button>
        </div>

        {/* HERO */}
        <section
          aria-labelledby="atleta-nome"
          className="relative overflow-hidden rounded-3xl border border-[color:var(--blue-light)]/20 bg-gradient-to-br from-[#050b1e] via-[#0a1736] to-[#050b1e] p-6 shadow-[0_30px_80px_-30px_rgba(26,127,212,0.55)] sm:p-10"
        >
          {/* glow orbs */}
          <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-[color:var(--blue-light)]/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#1a7fd4]/20 blur-3xl" aria-hidden />
          {/* grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(rgba(26,127,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,127,212,0.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-end">
            {/* Avatar with glow */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 -m-2 animate-pulse rounded-full bg-[color:var(--blue-light)] opacity-40 blur-2xl" aria-hidden />
              <div className="relative rounded-full p-1 bg-gradient-to-br from-[color:var(--blue-light)] via-[#1a7fd4] to-[color:var(--blue-dark)] shadow-[0_0_45px_-5px_var(--blue-light)]">
                <AthleteAvatar
                  src={profile.avatar_url ?? undefined}
                  alt={profile.nome}
                  className="h-36 w-36 sm:h-44 sm:w-44 border-4 border-[#050b1e]"
                />
              </div>
              {/* Overall badge */}
              <div className="absolute -bottom-2 -right-2 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[color:var(--blue-light)] bg-[#050b1e] text-[color:var(--blue-light)] shadow-[0_0_25px_-5px_var(--blue-light)]">
                <span className="font-display text-2xl font-extrabold leading-none">{overall}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[color:var(--blue-light)]/80">Geral</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--blue-light)]">
                {profile.posicao ?? "Atleta"}
              </p>
              <h1
                id="atleta-nome"
                className="mt-1 font-display text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl"
                style={{ textShadow: "0 0 30px rgba(26,127,212,0.45)" }}
              >
                {profile.nome}
              </h1>
              {profile.cidade && (
                <p className="mt-2 text-sm text-white/60">📍 {profile.cidade}</p>
              )}

              {/* Quick info */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <QuickStat icon={Star} label="Idade" value={idade != null ? `${idade}` : "—"} suffix={idade != null ? "anos" : undefined} />
                <QuickStat icon={Ruler} label="Altura" value={profile.altura ? `${profile.altura}` : "—"} suffix={profile.altura ? "cm" : undefined} />
                <QuickStat icon={Weight} label="Peso" value={profile.peso ? `${profile.peso}` : "—"} suffix={profile.peso ? "kg" : undefined} />
                <QuickStat icon={Footprints} label="Pé" value={profile.pe ?? "—"} />
              </div>
            </div>
          </div>
        </section>

        {/* Sobre + Habilidades */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Sobre */}
          <section
            aria-labelledby="sobre"
            className="lg:col-span-2 group relative overflow-hidden rounded-3xl border border-[color:var(--blue-light)]/15 bg-[#0a1428]/80 p-6 shadow-[0_20px_60px_-30px_rgba(26,127,212,0.4)] backdrop-blur sm:p-8"
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[color:var(--blue-light)]/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            <h2 id="sobre" className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--blue-light)]">
              <Sparkles className="h-4 w-4" /> Sobre
            </h2>
            {profile.bio ? (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/85">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm italic text-white/40">
                Conte sua história. Adicione uma bio em{" "}
                <Link to="/perfil" className="text-[color:var(--blue-light)] underline">
                  editar dados
                </Link>
                .
              </p>
            )}
          </section>

          {/* Habilidades */}
          <section
            aria-labelledby="hab"
            className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-[color:var(--blue-light)]/15 bg-[#0a1428]/80 p-6 shadow-[0_20px_60px_-30px_rgba(26,127,212,0.4)] backdrop-blur sm:p-8"
          >
            <h2 id="hab" className="mb-6 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--blue-light)]">
              <Zap className="h-4 w-4" /> Habilidades
            </h2>
            <ul className="space-y-5">
              {skills.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-white/90">
                        <Icon className="h-4 w-4 text-[color:var(--blue-light)]" />
                        {s.label}
                      </span>
                      <span className="font-display text-base font-extrabold text-[color:var(--blue-light)]">
                        {s.value}
                      </span>
                    </div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[color:var(--blue)] via-[color:var(--blue-light)] to-[#7cc6ff] shadow-[0_0_15px_var(--blue-light)] transition-[width] duration-[1200ms] ease-out"
                        style={{ width: animateBars ? `${s.value}%` : "0%" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Vídeo destaque */}
        <section
          aria-labelledby="videos"
          className="relative overflow-hidden rounded-3xl border border-[color:var(--blue-light)]/15 bg-[#0a1428]/80 p-6 shadow-[0_20px_60px_-30px_rgba(26,127,212,0.4)] backdrop-blur sm:p-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="videos" className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--blue-light)]">
              <Flame className="h-4 w-4" /> Vídeos em destaque
            </h2>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/30 p-3 sm:p-5">
            <AthleteVideoGallery atletaId={profile.id} canManage={true} />
          </div>
        </section>

        {/* Conquistas */}
        <section
          aria-labelledby="conq"
          className="relative overflow-hidden rounded-3xl border border-[color:var(--blue-light)]/15 bg-[#0a1428]/80 p-6 shadow-[0_20px_60px_-30px_rgba(26,127,212,0.4)] backdrop-blur sm:p-8"
        >
          <h2 id="conq" className="mb-6 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--blue-light)]">
            <Trophy className="h-4 w-4" /> Conquistas
          </h2>
          {conquistas.length === 0 ? (
            <p className="text-sm italic text-white/40">
              Suas conquistas vão aparecer aqui. Preencha estatísticas e histórico em{" "}
              <Link to="/perfil" className="text-[color:var(--blue-light)] underline">
                editar dados
              </Link>
              .
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {conquistas.map((c, i) => {
                const Icon = c.icon;
                return (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-[color:var(--blue-light)]/15 bg-gradient-to-br from-[#0e1c3a] to-[#06112a] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--blue-light)]/50 hover:shadow-[0_15px_40px_-15px_var(--blue-light)]"
                  >
                    <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[color:var(--blue-light)]/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    <Icon className="mb-3 h-8 w-8 text-[color:var(--blue-light)] drop-shadow-[0_0_8px_var(--blue-light)]" />
                    <p className="font-display text-sm font-extrabold leading-tight text-white">
                      {c.label}
                    </p>
                    {c.sub && (
                      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/50">
                        {c.sub}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
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
    <div className="rounded-2xl border border-[color:var(--blue-light)]/20 bg-white/[0.03] px-3 py-3 backdrop-blur transition-colors hover:border-[color:var(--blue-light)]/50">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--blue-light)]/80">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-2xl font-extrabold text-white">{value}</span>
        {suffix && <span className="text-xs text-white/60">{suffix}</span>}
      </div>
    </div>
  );
}
