import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Trophy,
  ClipboardList,
  AlertTriangle,
  Sparkles,
  Backpack,
  Clock,
  Brain,
  HeartHandshake,
  Ban,
  MessageCircle,
  Flag,
  Star,
  ChevronDown,
  UserCircle,
  Play,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "Manual do Atleta — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Guia interativo com tudo que você precisa para se destacar nas peneiras da Pelé Next Gen.",
      },
    ],
  }),
  component: ManualPage,
});

interface Section {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  short: string;
}

const SECTIONS: Section[] = [
  { id: "peneira", icon: Trophy, title: "O que é uma peneira", short: "Conceito" },
  { id: "inscricao", icon: ClipboardList, title: "Como se inscrever", short: "Inscrição" },
  { id: "levar", icon: Backpack, title: "O que levar no dia", short: "Checklist" },
  { id: "no-dia", icon: Clock, title: "No dia da peneira", short: "No dia" },
  { id: "avaliadores", icon: Brain, title: "O que os avaliadores observam", short: "Avaliação" },
  { id: "nao-fazer", icon: Ban, title: "O que NÃO fazer", short: "Evitar" },
  { id: "destaque", icon: MessageCircle, title: "Como se destacar", short: "Destaque" },
  { id: "apos", icon: Flag, title: "Após a peneira", short: "Depois" },
];

const LEAD_ITEMS = [
  "Documento de identificação",
  "Roupa esportiva adequada",
  "Chuteira",
  "Caneleira",
  "Garrafa de água",
  "Lanche leve (fruta / barra de cereal)",
  "Protetor solar",
  "Toalha pequena",
];

function ManualPage() {
  const [openId, setOpenId] = useState<string>("peneira");
  const [activeNav, setActiveNav] = useState<string>("peneira");

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setOpenId(id);
    // wait a tick so section is expanded before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  const toggleSection = (id: string) => {
    setOpenId((prev) => (prev === id ? "" : id));
  };

  return (
    <AppLayout>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar nav (desktop) */}
        <aside className="hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)] lg:self-start">
          <nav
            aria-label="Índice do manual"
            className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur"
          >
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> Índice
            </p>
            <ul className="space-y-1">
              {SECTIONS.map((s) => {
                const active = activeNav === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all",
                        active
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "text-muted-foreground hover:bg-bg3/60 hover:text-foreground",
                      )}
                    >
                      <s.icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="truncate">{s.short}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          {/* Hero */}
          <div className="animate-fade-in overflow-hidden rounded-3xl border border-primary/30 bg-gradient-blue p-8 shadow-card sm:p-12">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
              <BookOpen className="h-4 w-4" /> Manual do Atleta
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              Prepare-se para brilhar na peneira
            </h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/80 sm:text-lg">
              Um guia rápido, prático e interativo para você chegar confiante, mostrar seu
              melhor e sair na frente.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/peneiras">
                  <Sparkles className="mr-2 h-4 w-4" /> Ver peneiras disponíveis
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/perfil-atleta">
                  <UserCircle className="mr-2 h-4 w-4" /> Completar meu perfil
                </Link>
              </Button>
            </div>

          </div>

          {/* Mobile pill nav */}
          <nav
            aria-label="Índice"
            className="mt-4 -mx-2 flex gap-2 overflow-x-auto px-2 pb-2 lg:hidden"
          >
            {SECTIONS.map((s) => {
              const active = activeNav === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {s.short}
                </button>
              );
            })}
          </nav>

          {/* Sections */}
          <div className="mt-4 space-y-3">
            <Accordion
              section={SECTIONS[0]}
              open={openId === "peneira"}
              onToggle={() => toggleSection("peneira")}
            >
              <p className="text-foreground/90">
                A peneira é um processo seletivo onde treinadores avaliam jovens atletas para
                identificar talentos e possíveis oportunidades em equipes ou projetos esportivos.
              </p>
              <p className="mt-3 font-semibold text-foreground">É a sua chance de mostrar:</p>
              <BulletList items={["Seu futebol", "Sua disciplina", "Sua atitude"]} />
              <VideoPlaceholder title="O que esperar de uma peneira (2:30)" />
            </Accordion>

            <Accordion
              section={SECTIONS[1]}
              open={openId === "inscricao"}
              onToggle={() => toggleSection("inscricao")}
            >
              <StepList
                items={[
                  "Acesse o sistema da Pelé Next Gen",
                  "Procure peneiras disponíveis na sua região",
                  "Escolha a peneira desejada",
                  "Preencha seus dados corretamente",
                  "Confirme sua inscrição e salve o comprovante",
                ]}
              />
              <Callout tone="warning" title="Atenção">
                Verifique data, horário e local. Chegue com antecedência para evitar imprevistos.
              </Callout>
              <div className="mt-5">
                <Button asChild size="sm" className="rounded-lg">
                  <Link to="/peneiras">
                    <Sparkles className="mr-2 h-4 w-4" /> Me inscrever agora
                  </Link>
                </Button>
              </div>
            </Accordion>

            <Accordion
              section={SECTIONS[2]}
              open={openId === "levar"}
              onToggle={() => toggleSection("levar")}
            >
              <p className="text-foreground/90">
                Marque cada item conforme separar. O progresso é salvo automaticamente.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {CHECKLIST_ITEMS.map((item) => {
                  const active = !!checked[item];
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => toggleCheck(item)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                          active
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-bg2/50 text-foreground/80 hover:border-primary/30 hover:bg-bg3/60",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-transparent",
                          )}
                        >
                          {active && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                        <span className={cn(active && "line-through opacity-70")}>
                          {item}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Preparação
                  </p>
                  <p className="text-sm font-semibold text-foreground">{progress}% pronto</p>
                </div>
                <div className="h-2 w-40 overflow-hidden rounded-full bg-bg3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-gold-light transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Accordion>

            <Accordion
              section={SECTIONS[3]}
              open={openId === "no-dia"}
              onToggle={() => toggleSection("no-dia")}
            >
              <BulletList
                items={[
                  "Chegue pelo menos 30 minutos antes",
                  "Faça um bom aquecimento",
                  "Ouça atentamente os treinadores",
                  "Respire fundo — nervoso é normal",
                ]}
              />
              <Callout tone="tip" title="Dica de ouro">
                Cumprimente todos com um sorriso. Primeira impressão conta muito.
              </Callout>
            </Accordion>

            <Accordion
              section={SECTIONS[4]}
              open={openId === "avaliadores"}
              onToggle={() => toggleSection("avaliadores")}
            >
              <p className="font-semibold text-foreground">
                Estes são os cinco pilares avaliados 👇
              </p>

              <Pillar icon="⚽" title="1. Técnica">
                <BulletList items={["Domínio de bola", "Passe", "Finalização", "Controle"]} />
                <Tip>jogue simples e com segurança</Tip>
              </Pillar>

              <Pillar icon="🏃" title="2. Condicionamento físico">
                <BulletList items={["Velocidade", "Resistência", "Agilidade"]} />
                <Tip>mantenha intensidade durante toda a atividade</Tip>
              </Pillar>

              <Pillar icon="🧩" title="3. Inteligência de jogo">
                <BulletList items={["Posicionamento", "Tomada de decisão", "Visão de jogo"]} />
                <Tip>pense antes de agir, não jogue só pela bola</Tip>
              </Pillar>

              <Pillar icon="🤝" title="4. Trabalho em equipe">
                <BulletList items={["Passar a bola", "Comunicação", "Respeito aos colegas"]} />
                <Tip>futebol é coletivo — não jogue sozinho</Tip>
              </Pillar>

              <Pillar icon="🧘" title="5. Comportamento">
                <BulletList items={["Disciplina", "Respeito aos treinadores", "Postura"]} />
                <Tip>atitude conta MUITO (às vezes mais que habilidade)</Tip>
              </Pillar>
            </Accordion>

            <Accordion
              section={SECTIONS[5]}
              open={openId === "nao-fazer"}
              onToggle={() => toggleSection("nao-fazer")}
              tone="danger"
            >
              <BulletList
                items={[
                  "Reclamar ou discutir com colegas ou avaliadores",
                  "Jogar de forma individualista",
                  "Desrespeitar a comissão",
                  "Desistir no meio da atividade",
                  "Chegar sem aquecer ou sem hidratar",
                ]}
              />
              <Callout tone="error" title="Erro comum">
                Achar que só o gol importa. Movimentação sem bola pesa MUITO na avaliação.
              </Callout>
            </Accordion>

            <Accordion
              section={SECTIONS[6]}
              open={openId === "destaque"}
              onToggle={() => toggleSection("destaque")}
            >
              <BulletList
                items={[
                  "Seja esforçado o tempo todo",
                  "Demonstre vontade",
                  "Escute e siga instruções",
                  "Mantenha atitude positiva mesmo quando errar",
                ]}
              />
              <Callout tone="info" title="Lembre-se" icon={HeartHandshake}>
                Nem sempre o melhor tecnicamente é escolhido — quem tem atitude e disciplina sai
                na frente.
              </Callout>
            </Accordion>

            <Accordion
              section={SECTIONS[7]}
              open={openId === "apos"}
              onToggle={() => toggleSection("apos")}
            >
              <BulletList
                items={[
                  "Aguarde o resultado pelos canais informados",
                  "Continue treinando com a mesma intensidade",
                  "Não desista caso não seja selecionado",
                  "Peça feedback sempre que possível",
                ]}
              />
            </Accordion>
          </div>

          {/* Final CTA */}
          <div className="mt-8 animate-fade-in overflow-hidden rounded-3xl border border-primary/30 bg-gradient-gold p-8 text-center text-primary-foreground shadow-card">
            <Star className="mx-auto h-10 w-10" />
            <h3 className="mt-3 font-display text-2xl font-extrabold">Bora pra cima!</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium">
              A peneira é mais do que um teste — é uma oportunidade de crescimento. Dê o seu
              melhor, respeite todos e aproveite a experiência. ⚽
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-xl">
                <Link to="/peneiras">
                  <Sparkles className="mr-2 h-4 w-4" /> Ver peneiras disponíveis
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/perfil-atleta">
                  <UserCircle className="mr-2 h-4 w-4" /> Completar meu perfil
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ------------------------------ subcomponents ------------------------------ */

function Accordion({
  section,
  open,
  onToggle,
  children,
  tone = "default",
}: {
  section: Section;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  const Icon = section.icon;
  return (
    <section
      id={section.id}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-card transition-all",
        tone === "danger" ? "border-destructive/30" : "border-border",
        open && "ring-1 ring-primary/25",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-bg3/40 sm:p-5"
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform",
            tone === "danger"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary",
            open && "scale-105",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
            {section.title}
          </h2>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 pt-1 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2">
          <span
            aria-hidden
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
          />
          <span className="text-foreground/85">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="mt-2 space-y-2">
      {items.map((it, i) => (
        <li key={it} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {i + 1}
          </span>
          <span className="pt-0.5 text-foreground/90">{it}</span>
        </li>
      ))}
    </ol>
  );
}

function Pillar({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-bg2/60 p-4 transition-all hover:border-primary/30">
      <h3 className="font-display font-bold text-foreground">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <span className="font-bold">Dica:</span> {children}
      </span>
    </p>
  );
}

function Callout({
  tone,
  icon: IconProp,
  title,
  children,
}: {
  tone: "warning" | "info" | "tip" | "error";
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const config = {
    warning: {
      wrap: "border-l-4 border-l-gold-dark border border-gold-dark/30 bg-gold-dark/10",
      chip: "bg-gold-dark/20 text-gold-light",
      icon: IconProp ?? AlertTriangle,
      label: "text-gold-light",
    },
    info: {
      wrap: "border-l-4 border-l-blue-light border border-blue-light/30 bg-blue-light/10",
      chip: "bg-blue-light/20 text-blue-light",
      icon: IconProp ?? HeartHandshake,
      label: "text-blue-light",
    },
    tip: {
      wrap: "border-l-4 border-l-emerald-500 border border-emerald-500/30 bg-emerald-500/10",
      chip: "bg-emerald-500/20 text-emerald-400",
      icon: IconProp ?? Lightbulb,
      label: "text-emerald-400",
    },
    error: {
      wrap: "border-l-4 border-l-destructive border border-destructive/30 bg-destructive/10",
      chip: "bg-destructive/20 text-destructive",
      icon: IconProp ?? XCircle,
      label: "text-destructive",
    },
  }[tone];

  const Icon = config.icon;

  return (
    <div className={cn("mt-4 flex gap-3 rounded-xl p-4", config.wrap)}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          config.chip,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 text-sm">
        <p className={cn("font-bold uppercase tracking-wider text-xs", config.label)}>
          {title}
        </p>
        <p className="mt-1 text-foreground/85">{children}</p>
      </div>
    </div>
  );
}

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="mt-5 group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-bg2 to-bg3 transition-all hover:border-primary/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary/0.15),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
          <Play className="h-6 w-6 translate-x-0.5" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">Vídeo explicativo em breve</p>
      </div>
    </div>
  );
}
