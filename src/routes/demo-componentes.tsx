import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Calendar, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/demo-componentes")({
  component: DemoComponentes,
});

/**
 * Página interna para documentação visual dos estados dos componentes
 * do design system. Cada estado é renderizado explicitamente para
 * captura de tela — as classes utilitárias aplicadas reproduzem as
 * mesmas regras CSS que as pseudo-classes :hover, :focus-visible e
 * :active disparam no uso real.
 */
function DemoComponentes() {
  return (
    <div className="min-h-screen bg-background p-10 text-foreground">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-gradient-gold">
            Componentes & Estados — Pelé Next Gen
          </h1>
          <p className="text-muted-foreground">
            Default · Hover · Focus · Active · Disabled · Error
          </p>
        </header>

        {/* 1. BUTTON */}
        <section id="cmp-button" className="space-y-4">
          <h2 className="font-display text-xl font-semibold">1. Button (primary)</h2>
          <div className="flex flex-wrap items-end gap-6 rounded-2xl border border-border bg-card p-6">
            <StateBlock label="Default">
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all">
                Inscrever-se
              </button>
            </StateBlock>
            <StateBlock label="Hover">
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all">
                Inscrever-se
              </button>
            </StateBlock>
            <StateBlock label="Focus">
              <button className="inline-flex h-9 scale-[1.02] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-gold ring-2 ring-ring ring-offset-2 ring-offset-background transition-all">
                Inscrever-se
              </button>
            </StateBlock>
            <StateBlock label="Active">
              <button className="inline-flex h-9 translate-y-[1px] items-center justify-center rounded-md bg-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground shadow-inner transition-all">
                Inscrever-se
              </button>
            </StateBlock>
            <StateBlock label="Disabled">
              <button
                disabled
                className="pointer-events-none inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 shadow"
              >
                Inscrever-se
              </button>
            </StateBlock>
            <StateBlock label="Error">
              <button className="inline-flex h-9 animate-pulse items-center justify-center rounded-md bg-error px-4 py-2 text-sm font-medium text-white shadow-sm ring-2 ring-error/40 ring-offset-2 ring-offset-background">
                Falha ao inscrever
              </button>
            </StateBlock>
          </div>
        </section>

        {/* 2. INPUT */}
        <section id="cmp-input" className="space-y-4">
          <h2 className="font-display text-xl font-semibold">2. Input (campo de texto)</h2>
          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
            <StateBlock label="Default">
              <input
                placeholder="Seu e-mail"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground"
              />
            </StateBlock>
            <StateBlock label="Hover">
              <input
                placeholder="Seu e-mail"
                className="flex h-9 w-full rounded-md border border-input/80 bg-bg3/60 px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground"
              />
            </StateBlock>
            <StateBlock label="Focus">
              <input
                placeholder="Seu e-mail"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-ring placeholder:text-muted-foreground"
              />
            </StateBlock>
            <StateBlock label="Active (digitando)">
              <input
                defaultValue="pedro@pele.com"
                className="flex h-9 w-full rounded-md border border-primary/40 bg-transparent px-3 py-1 text-sm text-foreground shadow-sm"
              />
            </StateBlock>
            <StateBlock label="Disabled">
              <input
                disabled
                placeholder="Indisponível"
                className="flex h-9 w-full cursor-not-allowed rounded-md border border-input bg-transparent px-3 py-1 text-sm opacity-50 shadow-sm placeholder:text-muted-foreground"
              />
            </StateBlock>
            <StateBlock label="Error">
              <div className="space-y-1">
                <input
                  defaultValue="email-invalido"
                  aria-invalid="true"
                  className="flex h-9 w-full rounded-md border border-error bg-transparent px-3 py-1 text-sm text-foreground shadow-sm ring-1 ring-error/40"
                />
                <p className="text-xs text-error">E-mail inválido.</p>
              </div>
            </StateBlock>
          </div>
        </section>

        {/* 3. SELECT */}
        <section id="cmp-select" className="space-y-4">
          <h2 className="font-display text-xl font-semibold">3. Select (seleção)</h2>
          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
            <StateBlock label="Default">
              <SelectMock>Selecione a posição</SelectMock>
            </StateBlock>
            <StateBlock label="Hover">
              <SelectMock className="border-input/60 bg-bg3/60">Selecione a posição</SelectMock>
            </StateBlock>
            <StateBlock label="Focus">
              <SelectMock className="outline-none ring-1 ring-ring">
                Selecione a posição
              </SelectMock>
            </StateBlock>
            <StateBlock label="Active (aberto)">
              <div className="space-y-1">
                <SelectMock className="ring-1 ring-ring" filled>
                  Atacante
                </SelectMock>
                <div className="rounded-md border border-border bg-popover p-1 text-sm shadow-card">
                  <div className="rounded px-2 py-1 hover:bg-accent">Goleiro</div>
                  <div className="rounded bg-primary/10 px-2 py-1 text-primary">Atacante</div>
                  <div className="rounded px-2 py-1 hover:bg-accent">Zagueiro</div>
                </div>
              </div>
            </StateBlock>
            <StateBlock label="Disabled">
              <SelectMock disabled>Indisponível</SelectMock>
            </StateBlock>
            <StateBlock label="Error">
              <div className="space-y-1">
                <SelectMock className="border-error ring-1 ring-error/40">
                  Posição obrigatória
                </SelectMock>
                <p className="text-xs text-error">Selecione uma posição.</p>
              </div>
            </StateBlock>
          </div>
        </section>

        {/* 4. CARD */}
        <section id="cmp-card" className="space-y-4">
          <h2 className="font-display text-xl font-semibold">4. Card</h2>
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
            <StateBlock label="Default">
              <SimpleCard />
            </StateBlock>
            <StateBlock label="Hover">
              <SimpleCard className="-translate-y-1 border-primary/40 shadow-gold" />
            </StateBlock>
            <StateBlock label="Focus">
              <SimpleCard className="outline-none ring-2 ring-ring ring-offset-2 ring-offset-background" />
            </StateBlock>
            <StateBlock label="Active (selecionado)">
              <SimpleCard className="border-primary bg-primary/5 shadow-gold" />
            </StateBlock>
            <StateBlock label="Disabled">
              <SimpleCard className="pointer-events-none opacity-50 grayscale" />
            </StateBlock>
            <StateBlock label="Error">
              <SimpleCard
                className="border-error ring-1 ring-error/40"
                badge="ERRO"
                badgeClass="bg-error text-white"
              />
            </StateBlock>
          </div>
        </section>

        {/* 5. PENEIRA CARD (composto) */}
        <section id="cmp-composite" className="space-y-4">
          <h2 className="font-display text-xl font-semibold">5. PeneiraCard (composto)</h2>
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
            <StateBlock label="Default">
              <PeneiraMock />
            </StateBlock>
            <StateBlock label="Hover">
              <PeneiraMock state="hover" />
            </StateBlock>
            <StateBlock label="Focus">
              <PeneiraMock state="focus" />
            </StateBlock>
            <StateBlock label="Active (inscrito)">
              <PeneiraMock state="active" />
            </StateBlock>
            <StateBlock label="Disabled (lotada)">
              <PeneiraMock state="disabled" />
            </StateBlock>
            <StateBlock label="Error">
              <PeneiraMock state="error" />
            </StateBlock>
          </div>
        </section>

        <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
          Acessibilidade: foco é sempre indicado por anel visível (
          <code>ring-2 ring-ring</code>) — outline nativo só é removido quando
          substituído por esse anel.
        </footer>
      </div>
    </div>
  );
}

function StateBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-[180px] flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function SelectMock({
  children,
  className = "",
  disabled,
  filled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  filled?: boolean;
}) {
  return (
    <div
      className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      <span className={filled ? "text-foreground" : "text-muted-foreground"}>{children}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  );
}

function SimpleCard({
  className = "",
  badge,
  badgeClass = "bg-primary text-primary-foreground",
}: {
  className?: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <article
      className={`relative rounded-xl border border-border bg-bg2 p-4 shadow-card transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">Atleta destaque</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
        >
          {badge ?? "TOP"}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Atacante · 17 anos · SP</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg3">
        <div className="h-full w-3/4 rounded-full bg-gradient-gold" />
      </div>
    </article>
  );
}

function PeneiraMock({ state }: { state?: "hover" | "focus" | "active" | "disabled" | "error" }) {
  const base =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all";
  const stateClass =
    state === "hover"
      ? "-translate-y-1 border-primary/40 shadow-gold"
      : state === "focus"
        ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
        : state === "active"
          ? "border-primary bg-primary/5 shadow-gold"
          : state === "disabled"
            ? "opacity-50 grayscale pointer-events-none"
            : state === "error"
              ? "border-error ring-1 ring-error/40"
              : "";
  const ctaLabel =
    state === "active"
      ? "Inscrito ✓"
      : state === "disabled"
        ? "Vagas esgotadas"
        : state === "error"
          ? "Falha — tentar de novo"
          : "Ver detalhes";
  const ctaClass =
    state === "active"
      ? "bg-success text-white"
      : state === "error"
        ? "bg-error text-white"
        : "bg-primary text-primary-foreground";

  return (
    <article className={`${base} ${stateClass}`}>
      <div className="relative h-24 overflow-hidden bg-gradient-blue">
        <span className="absolute left-3 top-3 rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Aberta
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-sm font-bold leading-tight">Peneira Sub-17 — São Paulo</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary" /> CT do Morumbi · SP
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-primary" /> 12 jul 2026 · 14h
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-primary" /> 38/60 inscritos
          </div>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-bg3">
          <div className="h-full w-3/5 rounded-full bg-gradient-gold" />
        </div>
        <button
          className={`mt-auto inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium ${ctaClass}`}
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}
