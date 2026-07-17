import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  Footprints,
  Medal,
  Ruler,
  Share2,
  Star,
  Trophy,
  Weight,
  Zap,
} from "lucide-react";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { SkillsDisplay } from "@/components/SkillsDisplay";
import { Button } from "@/components/ui/button";
import { parseSkills } from "@/lib/skills";
import { fromISODate } from "@/lib/date";
import {
  getPublicAtleta,
  type PublicClube,
  type PublicTitulo,
} from "@/lib/public-atleta.functions";
import { ACHIEVEMENT_ICONS } from "@/components/icons/FootballIcons";

function calcIdade(dob: string | null): number | null {
  if (!dob) return null;
  const d = fromISODate(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export const Route = createFileRoute("/a/$atletaId")({
  loader: async ({ params }) => {
    const data = await getPublicAtleta({ data: { id: params.atletaId } });
    if (!data) throw notFound();
    return { atleta: data };
  },
  head: ({ params, loaderData }) => {
    const url = `https://pelescout-nextgen.lovable.app/a/${params.atletaId}`;
    const atleta = loaderData?.atleta;
    const nome = atleta?.nome ?? "Atleta";
    const posicao = atleta?.posicao ?? "Atleta";
    const cidade = atleta?.cidade ? ` · ${atleta.cidade}` : "";
    const idade = atleta ? calcIdade(atleta.data_nascimento) : null;
    const title = `${nome} — ${posicao}${cidade}${idade ? ` · ${idade} anos` : ""}`;
    const description =
      atleta?.bio?.slice(0, 155) ??
      `Perfil do atleta ${nome} na Pelé Next Gen — habilidades, estatísticas e histórico de clubes.`;
    const image = atleta?.avatar_url ?? undefined;
    const meta: { name?: string; property?: string; content: string; title?: string }[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url,
            mainEntity: {
              "@type": "Person",
              name: nome,
              jobTitle: posicao,
              address: atleta?.cidade ?? undefined,
              image,
            },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <PublicShell>
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Não foi possível carregar o perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button asChild className="mt-6"><Link to="/">Voltar</Link></Button>
      </div>
    </PublicShell>
  ),
  notFoundComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Perfil não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link pode estar expirado ou o atleta removeu o perfil público.
        </p>
        <Button asChild className="mt-6"><Link to="/">Ir para o site</Link></Button>
      </div>
    </PublicShell>
  ),
  component: PublicAtletaPage,
});

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-bg2/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
            Pelé <span className="text-primary">Next Gen</span>
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link to="/cadastro">Criar meu perfil</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function PublicAtletaPage() {
  const { atleta } = Route.useLoaderData();
  const idade = calcIdade(atleta.data_nascimento);
  const clubes: PublicClube[] = atleta.historico_clubes ?? [];
  const titulos: PublicTitulo[] = [...(atleta.stats?.titulos_lista ?? [])].sort(
    (a, b) => (b.ano ?? 0) - (a.ano ?? 0),
  );
  const totalTitulos = titulos.length || atleta.stats?.titulos || 0;

  const conquistas: { label: string; sub?: string }[] = [];
  if (totalTitulos)
    conquistas.push({ label: "Campeão", sub: `${totalTitulos} título${totalTitulos > 1 ? "s" : ""}` });
  if (atleta.stats?.gols) conquistas.push({ label: `${atleta.stats.gols} Gols`, sub: "Marcados" });
  if (atleta.stats?.assistencias)
    conquistas.push({ label: `${atleta.stats.assistencias} Assistências`, sub: "Visão de jogo" });
  if (atleta.stats?.jogos) conquistas.push({ label: `${atleta.stats.jogos} Jogos`, sub: "Disputados" });

  const shareUrl = `https://pelescout-nextgen.lovable.app/a/${atleta.id}`;

  return (
    <PublicShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3 w-3" /> Perfil público
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{atleta.nome}</h1>
            <p className="text-sm text-muted-foreground">
              {atleta.posicao ?? "Atleta"}
              {atleta.cidade ? ` · ${atleta.cidade}` : ""}
            </p>
          </div>
          <ShareButton url={shareUrl} nome={atleta.nome} />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full p-[3px] bg-gradient-to-br from-primary/60 via-primary to-primary/40 shadow-card">
                <AthleteAvatar
                  src={atleta.avatar_url ?? undefined}
                  alt={atleta.nome}
                  className="h-36 w-36 sm:h-44 sm:w-44 border-2 border-background"
                />
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold uppercase tracking-tight">{atleta.nome}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {atleta.posicao ?? "Atleta"}
              </p>
              <div className="mt-5 grid w-full grid-cols-4 gap-2">
                <Stat icon={Star} label="Idade" value={idade != null ? `${idade}` : "—"} suffix={idade != null ? "anos" : undefined} />
                <Stat icon={Ruler} label="Altura" value={atleta.altura ? (atleta.altura / 100).toFixed(2).replace(".", ",") : "—"} suffix={atleta.altura ? "m" : undefined} />
                <Stat icon={Weight} label="Peso" value={atleta.peso ? `${atleta.peso}` : "—"} suffix={atleta.peso ? "kg" : undefined} />
                <Stat icon={Footprints} label="Pé" value={atleta.pe ?? "—"} />
              </div>
              {atleta.skills_validated && Object.keys(atleta.skills_validated).length > 0 && (
                <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <BadgeCheck className="h-3 w-3" /> Habilidades validadas
                </span>
              )}
            </div>
          </section>

          <section className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">Sobre mim</h2>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            {atleta.bio ? (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{atleta.bio}</p>
            ) : (
              <p className="mt-4 text-sm italic text-muted-foreground">Este atleta ainda não escreveu uma bio.</p>
            )}
            <div className="mt-6">
              <SkillsDisplay
                self={parseSkills(atleta.skills)}
                validated={parseSkills(atleta.skills_validated)}
                validatedAt={atleta.skills_validated_at}
                animate
              />
            </div>
          </section>
        </div>

        {(clubes.length > 0 || titulos.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-2">
            {clubes.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  <Building2 className="h-4 w-4" /> Clubes por onde passei
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <ul className="mt-4 space-y-3">
                  {clubes.map((c, i) => (
                    <li key={i} className="rounded-xl border border-border bg-bg2 p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display text-sm font-extrabold">{c.clube}</p>
                        {c.periodo && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.periodo}</span>
                        )}
                      </div>
                      {c.descricao && (
                        <p className="mt-1 text-xs text-muted-foreground">{c.descricao}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {titulos.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  <Medal className="h-4 w-4" /> Títulos conquistados
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <ul className="mt-4 space-y-2">
                  {titulos.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-bg2 p-3">
                      <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-extrabold leading-tight">{t.campeonato}</p>
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

        {conquistas.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">Conquistas</h2>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {conquistas.slice(0, 4).map((c, i) => {
                const Icon = ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length];
                return (
                  <li key={i} className="rounded-xl border border-border bg-gradient-to-br from-bg2 to-bg2/60 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent ring-1 ring-primary/30">
                      <Icon size={26} className="text-primary" />
                    </div>
                    <p className="font-display text-sm font-extrabold leading-tight">{c.label}</p>
                    {c.sub && <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{c.sub}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="font-display text-lg font-extrabold">Quer o seu próprio perfil como este?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie um perfil de atleta grátis, conecte-se a clubes e monte sua vitrine profissional.
          </p>
          <Button asChild className="mt-4"><Link to="/cadastro">Criar conta grátis</Link></Button>
        </div>
      </div>
    </PublicShell>
  );
}

function Stat({
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
        <span className="font-display text-lg font-extrabold sm:text-xl">{value}</span>
        {suffix && <span className="text-[10px] font-semibold text-muted-foreground">{suffix}</span>}
      </div>
      <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
    </div>
  );
}

function ShareButton({ url, nome }: { url: string; nome: string }) {
  async function share() {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: `${nome} — Pelé Next Gen`, url });
        return;
      } catch {
        /* fallthrough */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copiado!");
    } catch {
      window.prompt("Copie o link:", url);
    }
  }
  return (
    <Button type="button" size="sm" onClick={share}>
      <Share2 className="mr-2 h-4 w-4" /> Compartilhar
    </Button>
  );
}
