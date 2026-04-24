import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trophy, Sparkles, Target } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pelé Next Gen — A nova geração do futebol começa aqui!" },
      {
        name: "description",
        content:
          "Inscreva-se em peneiras oficiais, seja avaliado por olheiros profissionais e dê o próximo passo na sua carreira no futebol.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/cadastro">Cadastrar</Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-12 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma oficial
            </span>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              A nova geração do{" "}
              <span className="text-gradient-gold">futebol</span> começa aqui!
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Cadastre-se na Pelé Next Gen, participe de peneiras dos maiores clubes do Brasil e
              seja avaliado por olheiros profissionais. Sua chance de mostrar talento começa agora.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link to="/cadastro">
                  Quero ser atleta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat number="120+" label="Peneiras realizadas" />
              <Stat number="8.4k" label="Atletas cadastrados" />
              <Stat number="320" label="Talentos descobertos" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-gold opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80"
                alt="Atleta jovem driblando em campo"
                className="h-[520px] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-6">
                <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card/90 p-4 backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold">
                    <Trophy className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold">Próxima peneira</p>
                    <p className="text-sm text-muted-foreground">
                      Sub-17 · Santos/SP · 18 mai
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-bg2/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={Trophy}
            title="Peneiras oficiais"
            text="Acesse seletivas dos maiores centros de treinamento do país."
          />
          <Feature
            icon={Target}
            title="Avaliações de olheiros"
            text="Seu desempenho é registrado em tempo real por profissionais."
          />
          <Feature
            icon={Sparkles}
            title="Seu perfil profissional"
            text="Construa um histórico de avaliações que clubes podem visualizar."
          />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pelé Next Gen — Academia
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-extrabold text-gradient-gold">{number}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
