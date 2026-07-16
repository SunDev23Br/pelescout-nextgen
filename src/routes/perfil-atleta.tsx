import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Footprints,
  Loader2,
  Medal,
  Ruler,
  Settings,
  Star,
  Trophy,
  Weight,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteVideoGallery } from "@/components/AthleteVideoGallery";
import { Button } from "@/components/ui/button";
import { WearableMetricsCard } from "@/components/WearableMetricsCard";
import { SkillsDisplay } from "@/components/SkillsDisplay";
import { parseSkills } from "@/lib/skills";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { fromISODate } from "@/lib/date";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil-atleta")({
  head: () => ({
    meta: [
      { title: "Perfil do Atleta — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Vitrine profissional do atleta: destaques, habilidades, vídeos e conquistas.",
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
interface TituloItem {
  campeonato: string;
  ano: number | null;
  time: string;
}
interface AthleteStats {
  jogos?: number | null;
  gols?: number | null;
  assistencias?: number | null;
  titulos?: number | null;
  titulos_lista?: TituloItem[];
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
  skills: unknown;
  skills_validated: unknown;
  skills_validated_at: string | null;
  skills_validated_by: string | null;
}

function calcIdade(dob: string | null): number | null {
  if (!dob) return null;
  const d = fromISODate(dob);
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
            historico_clubes:
              (data.historico_clubes as ClubeHistorico[] | null) ?? [],
            stats: (data.stats as AthleteStats | null) ?? {},
          } as FullProfile);
        }
        setLoading(false);
        requestAnimationFrame(() => setAnimateBars(true));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const skills = useMemo(() => {
    const s = profile?.stats ?? {};
    const cap = (n: number, max: number) =>
      Math.min(100, Math.round((n / max) * 100));
    const base = s.jogos != null ? cap(s.jogos, 100) : 70;
    return [
      { label: "Marcação", value: Math.min(100, base + 10) },
      { label: "Força", value: Math.max(40, base - 5) },
      {
        label: "Passe",
        value: s.assistencias != null ? cap(s.assistencias, 25) : 75,
      },
      { label: "Velocidade", value: Math.max(50, base) },
      {
        label: "Posicionamento",
        value: s.gols != null ? cap(s.gols, 30) + 30 : 80,
      },
    ];
  }, [profile]);

  if (!ready || loading || !user) {
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
        <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
          Perfil não encontrado.
        </div>
      </AppLayout>
    );
  }

  const idade = calcIdade(profile.data_nascimento);

  const titulosLista = [...(profile.stats.titulos_lista ?? [])].sort(
    (a, b) => (b.ano ?? 0) - (a.ano ?? 0),
  );
  const totalTitulos = titulosLista.length || profile.stats.titulos || 0;
  const clubes = profile.historico_clubes ?? [];

  const conquistas: { label: string; sub?: string }[] = [];
  if (totalTitulos)
    conquistas.push({
      label: "Campeão",
      sub: `${totalTitulos} título${totalTitulos > 1 ? "s" : ""}`,
    });
  if (profile.stats.gols)
    conquistas.push({ label: `${profile.stats.gols} Gols`, sub: "Marcados" });
  if (profile.stats.assistencias)
    conquistas.push({
      label: `${profile.stats.assistencias} Assistências`,
      sub: "Visão de jogo",
    });
  if (profile.stats.jogos)
    conquistas.push({
      label: `${profile.stats.jogos} Jogos`,
      sub: "Disputados",
    });
  clubes.slice(0, 2).forEach((c) =>
    conquistas.push({ label: c.clube, sub: c.periodo ?? "Passagem" }),
  );


  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
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
          <Button asChild variant="outline" size="sm">
            <Link to="/perfil">
              <Settings className="mr-2 h-4 w-4" /> Editar dados
            </Link>
          </Button>
        </div>

        <div className="space-y-6">


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
                  Conte sua história. Adicione uma bio em{" "}
                  <Link to="/perfil" className="text-primary underline">
                    editar dados
                  </Link>
                  .
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
                        style={{
                          width: animateBars ? `${s.value}%` : "0%",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Wearable metrics */}
        <WearableMetricsCard atletaId={profile.id} />

        {/* Clubes + Títulos */}
        {(clubes.length > 0 || titulosLista.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-2">
            {clubes.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  <Building2 className="h-4 w-4" /> Clubes por onde passei
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <ul className="mt-4 space-y-3">
                  {clubes.map((c, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-border bg-bg2 p-3"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display text-sm font-extrabold">
                          {c.clube}
                        </p>
                        {c.periodo && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {c.periodo}
                          </span>
                        )}
                      </div>
                      {c.descricao && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.descricao}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {titulosLista.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  <Medal className="h-4 w-4" /> Títulos conquistados
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <ul className="mt-4 space-y-2">
                  {titulosLista.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border bg-bg2 p-3"
                    >
                      <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-extrabold leading-tight">
                          {t.campeonato}
                        </p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                          {[t.ano, t.time].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}





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
              <AthleteVideoGallery atletaId={profile.id} canManage={true} />
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
                Suas conquistas vão aparecer aqui. Preencha estatísticas em{" "}
                <Link to="/perfil" className="text-primary underline">
                  editar dados
                </Link>
                .
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
