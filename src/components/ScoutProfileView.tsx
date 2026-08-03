import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Eye,
  Handshake,
  Instagram,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Settings,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { startConversation } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ScoutProfileViewProps {
  userId: string;
  /** "self" = o próprio olheiro vendo seu perfil; "public" = visitante (atleta, clube). */
  variant: "self" | "public";
}

interface ScoutProfile {
  id: string;
  nome: string;
  email: string | null;
  avatar_url: string | null;
  cidade: string | null;
  celular: string | null;
  bio: string | null;
}

interface ScoutStats {
  observados: number;
  avaliacoes: number;
  indicacoes: number;
  aprovados: number;
  media: number | null;
}

interface AgendaItem {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  data: string;
}

const ESPECIALIDADES = [
  "Sub-11",
  "Sub-13",
  "Sub-15",
  "Sub-17",
  "Sub-20",
  "Profissional",
  "Feminino",
];

const POSICOES = [
  { emoji: "🥅", label: "Goleiros" },
  { emoji: "🛡️", label: "Zagueiros" },
  { emoji: "🏃", label: "Laterais" },
  { emoji: "⚙️", label: "Volantes" },
  { emoji: "🎯", label: "Meias" },
  { emoji: "⚽", label: "Atacantes" },
];

const COMPETICOES = [
  "Paulistão",
  "Copinha",
  "Brasileirão Sub-20",
  "Mineiro",
  "Copa do Brasil",
  "Libertadores Sub-20",
];

const EXPERIENCIA = [
  { periodo: "2025", cargo: "Scout Independente" },
  { periodo: "2022 – 2025", cargo: "Palmeiras" },
  { periodo: "2018 – 2022", cargo: "Projeto Talentos Brasil" },
  { periodo: "2015 – 2018", cargo: "Categorias de Base" },
];

export function ScoutProfileView({ userId, variant }: ScoutProfileViewProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ScoutProfile | null>(null);
  const [stats, setStats] = useState<ScoutStats | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [disponivel, setDisponivel] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [prof, statsRes, peneiras] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nome, email, avatar_url, cidade, celular, bio")
          .eq("id", userId)
          .maybeSingle(),
        supabase.rpc("get_olheiro_public_stats", { _scout: userId }),
        supabase
          .from("peneiras")
          .select("id, titulo, cidade, estado, data")
          .gte("data", new Date().toISOString().slice(0, 10))
          .order("data", { ascending: true })
          .limit(5),
      ]);

      if (cancelled) return;
      if (prof.error) toast.error(prof.error.message);
      setProfile((prof.data as ScoutProfile | null) ?? null);

      const row = Array.isArray(statsRes.data) ? statsRes.data[0] : null;
      setStats(
        row
          ? {
              observados: Number(row.observados) || 0,
              avaliacoes: Number(row.avaliacoes) || 0,
              indicacoes: Number(row.indicacoes) || 0,
              aprovados: Number(row.aprovados) || 0,
              media: row.media != null ? Number(row.media) : null,
            }
          : null,
      );
      setAgenda((peneiras.data ?? []) as AgendaItem[]);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const nota = useMemo(() => {
    if (!stats?.media) return null;
    // notas do sistema são 0–10, exibidas em escala 0–5
    return Math.round((stats.media / 2) * 10) / 10;
  }, [stats]);

  async function handleContato() {
    setStarting(true);
    try {
      await startConversation(userId);
      navigate({ to: "/chat" });
    } catch {
      // atletas não podem iniciar conversa; encaminha para a caixa de mensagens
      navigate({ to: "/chat" });
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-48 animate-pulse rounded-3xl bg-card" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando perfil…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display text-xl font-extrabold">
          Perfil não disponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você só pode visualizar o perfil completo de olheiros com quem tem uma
          conversa ativa.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/chat">
            <MessageCircle className="mr-2 h-4 w-4" /> Ir para mensagens
          </Link>
        </Button>
      </div>
    );
  }

  const whats = (profile.celular ?? "").replace(/\D/g, "");
  const isSelf = variant === "self";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <div className="rounded-full bg-gradient-to-br from-primary/70 via-primary to-primary/40 p-[3px] shadow-card">
              <AthleteAvatar
                src={profile.avatar_url ?? undefined}
                alt={profile.nome}
                className="h-[120px] w-[120px] border-2 border-background"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <BadgeCheck className="h-3.5 w-3.5" /> Olheiro verificado
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {profile.nome}
            </h1>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Scout Profissional
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {profile.cidade ?? "Cidade não informada"}
              </span>
              {profile.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary" />
                  {profile.email}
                </span>
              )}
              {profile.celular && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-primary" />
                  {profile.celular}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Stars value={nota ?? 4.9} />
              <span className="font-display text-lg font-extrabold">
                {(nota ?? 4.9).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                {stats?.avaliacoes ?? 0} avaliações registradas
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 lg:w-56">
            <Button
              className="w-full"
              onClick={isSelf ? undefined : handleContato}
              disabled={starting}
              asChild={isSelf}
            >
              {isSelf ? (
                <Link to="/chat">
                  <Send className="mr-2 h-4 w-4" /> Enviar vídeo para avaliação
                </Link>
              ) : (
                <span>
                  {starting ? (
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 inline h-4 w-4" />
                  )}
                  Enviar vídeo para avaliação
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={isSelf ? undefined : handleContato}
              disabled={starting}
              asChild={isSelf}
            >
              {isSelf ? (
                <Link to="/chat">
                  <MessageCircle className="mr-2 h-4 w-4" /> Entrar em contato
                </Link>
              ) : (
                <span>
                  <MessageCircle className="mr-2 inline h-4 w-4" /> Entrar em
                  contato
                </span>
              )}
            </Button>
            {isSelf && (
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/perfil">
                  <Settings className="mr-2 h-4 w-4" /> Editar dados
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ESTATÍSTICAS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Atletas observados"
          value={stats?.observados ?? 0}
        />
        <StatCard
          icon={Star}
          label="Avaliações"
          value={stats?.avaliacoes ?? 0}
        />
        <StatCard
          icon={Handshake}
          label="Indicações"
          value={stats?.indicacoes ?? 0}
        />
        <StatCard
          icon={Trophy}
          label="Atletas aprovados"
          value={stats?.aprovados ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* COLUNA PRINCIPAL */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Sobre o olheiro">
            {profile.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Atua identificando atletas para categorias de base e equipes
                profissionais, com foco na análise técnica, física e tática de
                jovens jogadores.
                {isSelf && (
                  <>
                    {" "}
                    Adicione sua biografia em{" "}
                    <Link to="/perfil" className="text-primary underline">
                      editar dados
                    </Link>
                    .
                  </>
                )}
              </p>
            )}
          </Card>

          <Card title="Especialidades">
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES.map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  {e}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Posições observadas">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {POSICOES.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-bg2 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-sm font-semibold">{p.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Experiência">
            <ol className="relative space-y-5 border-l border-border pl-6">
              {EXPERIENCIA.map((x) => (
                <li key={x.periodo} className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-primary/15" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    {x.periodo}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 font-display text-sm font-extrabold">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {x.cargo}
                  </p>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Competições acompanhadas">
            <div className="flex flex-wrap gap-2">
              {COMPETICOES.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg2 px-3 py-2 text-xs font-bold transition-colors hover:border-primary/40"
                >
                  <Award className="h-3.5 w-3.5 text-primary" />
                  {c}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Agenda">
            {agenda.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                text="Nenhuma peneira agendada no momento."
              />
            ) : (
              <ul className="space-y-3">
                {agenda.map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/peneiras/$peneiraId"
                      params={{ peneiraId: p.id }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-bg2 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                    >
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="font-display text-sm font-extrabold leading-none">
                          {p.data.slice(8, 10)}
                        </span>
                        <span className="text-[9px] font-bold uppercase">
                          {monthShort(p.data)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-extrabold">
                          {p.titulo}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.cidade} · {p.estado}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <section className="sticky top-6 space-y-6">
            <div className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-card backdrop-blur">
              <AthleteAvatar
                src={profile.avatar_url ?? undefined}
                alt={profile.nome}
                className="mx-auto h-20 w-20 border-2 border-primary/40"
              />
              <p className="mt-3 font-display text-lg font-extrabold">
                {profile.nome}
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <Stars value={nota ?? 4.9} small />
                <span className="text-xs font-bold">
                  {(nota ?? 4.9).toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {profile.cidade ?? "Brasil"} · Base e profissional
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Especialidade: análise técnica e tática
              </p>
              {isSelf ? (
                <Button asChild className="mt-4 w-full">
                  <Link to="/chat">
                    <Send className="mr-2 h-4 w-4" /> Enviar vídeo
                  </Link>
                </Button>
              ) : (
                <Button
                  className="mt-4 w-full"
                  onClick={handleContato}
                  disabled={starting}
                >
                  <Send className="mr-2 h-4 w-4" /> Enviar vídeo
                </Button>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Disponibilidade
              </p>
              {isSelf ? (
                <button
                  type="button"
                  onClick={() => setDisponivel((v) => !v)}
                  className={cn(
                    "mt-3 flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                    disponivel
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                      : "border-red-500/40 bg-red-500/10 text-red-500",
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      disponivel ? "bg-emerald-500" : "bg-red-500",
                    )}
                  />
                  {disponivel ? "Recebendo vídeos" : "Agenda fechada"}
                </button>
              ) : (
                <div className="mt-3 flex w-full items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm font-bold text-emerald-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Recebendo vídeos
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Contato
              </p>
              <div className="mt-3 grid gap-2">
                {whats && (
                  <ContactButton
                    icon={Phone}
                    label="WhatsApp"
                    href={`https://wa.me/55${whats}`}
                  />
                )}
                {profile.email && (
                  <ContactButton
                    icon={Mail}
                    label="Email"
                    href={`mailto:${profile.email}`}
                  />
                )}
                <ContactButton
                  icon={Instagram}
                  label="Instagram"
                  href="https://instagram.com"
                />
                <ContactButton
                  icon={Linkedin}
                  label="LinkedIn"
                  href="https://linkedin.com"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Última atividade
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                {stats?.avaliacoes
                  ? `${stats.avaliacoes} avaliações realizadas`
                  : "Nenhuma avaliação ainda"}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function monthShort(iso: string) {
  const m = Number(iso.slice(5, 7)) - 1;
  return (
    [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ][m] ?? ""
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lg">
      <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
        {title}
      </h2>
      <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-gradient-to-br from-card to-bg2 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/25 transition-transform group-hover:scale-105">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold tabular-nums">
        {value.toLocaleString("pt-BR")}
      </p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Stars({ value, small }: { value: number; small?: boolean }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Nota ${value}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            small ? "h-3.5 w-3.5" : "h-4 w-4",
            i < Math.round(value)
              ? "fill-primary text-primary"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

function ContactButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-bg2 px-3 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </a>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
      <Icon className="mb-2 h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
