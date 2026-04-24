import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Trophy,
  ClipboardList,
  AlertTriangle,
  Sparkles,
  Backpack,
  Clock,
  Brain,
  Users,
  HeartHandshake,
  Smile,
  Ban,
  MessageCircle,
  Flag,
  Star,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "Manual do Atleta — Pelé Next Gen" },
      {
        name: "description",
        content: "Tudo que você precisa saber para se destacar nas peneiras da Pelé Next Gen.",
      },
    ],
  }),
  component: ManualPage,
});

function ManualPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-blue p-8 shadow-card sm:p-12">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            <BookOpen className="h-4 w-4" /> Manual do Usuário
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Jovens Atletas
          </h1>
          <p className="mt-2 text-lg text-foreground/80">
            Inscrição e participação em peneiras
          </p>
        </div>

        <Card icon={Trophy} title="O que é uma peneira?">
          <p>
            A peneira é um processo seletivo onde treinadores avaliam jovens atletas para
            identificar talentos e possíveis oportunidades em equipes ou projetos esportivos.
          </p>
          <p className="mt-3">É a sua chance de mostrar:</p>
          <List items={["Seu futebol", "Sua disciplina", "Sua atitude"]} />
        </Card>

        <Card icon={ClipboardList} title="📝 Como se inscrever na peneira">
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>Acesse o sistema da Pelé Academia</li>
            <li>Procure peneiras disponíveis</li>
            <li>Escolha a peneira desejada</li>
            <li>Preencha seus dados corretamente</li>
            <li>Confirme sua inscrição</li>
          </ol>
          <Callout tone="warning" icon={AlertTriangle} title="Atenção">
            Verifique data, horário e local. Chegue com antecedência.
          </Callout>
        </Card>

        <Card icon={Backpack} title="🎒 O que levar no dia">
          <List
            items={[
              "Documento de identificação",
              "Roupa esportiva adequada",
              "Chuteira",
              "Garrafa de água",
              "Protetor solar (se necessário)",
            ]}
          />
        </Card>

        <Card icon={Clock} title="⏰ No dia da peneira">
          <List
            items={[
              "Chegue pelo menos 30 minutos antes",
              "Faça aquecimento",
              "Ouça atentamente os treinadores",
            ]}
          />
        </Card>

        <Card icon={Brain} title="🧠 O que os avaliadores observam">
          <p className="font-semibold text-foreground">
            Aqui está o ponto MAIS importante 👇
          </p>

          <Subsection icon="⚽" title="1. Técnica">
            <List items={["Domínio de bola", "Passe", "Finalização", "Controle"]} />
            <Tip>jogue simples e com segurança</Tip>
          </Subsection>

          <Subsection icon="🏃" title="2. Condicionamento físico">
            <List items={["Velocidade", "Resistência", "Agilidade"]} />
            <Tip>mantenha intensidade durante toda a atividade</Tip>
          </Subsection>

          <Subsection icon="🧩" title="3. Inteligência de jogo">
            <List items={["Posicionamento", "Tomada de decisão", "Visão de jogo"]} />
            <Tip>pense antes de agir, não jogue só pela bola</Tip>
          </Subsection>

          <Subsection icon="🤝" title="4. Trabalho em equipe">
            <List items={["Passar a bola", "Comunicação", "Respeito aos colegas"]} />
            <Tip>futebol é coletivo — não jogue sozinho</Tip>
          </Subsection>

          <Subsection icon="🧘" title="5. Comportamento">
            <List items={["Disciplina", "Respeito aos treinadores", "Postura"]} />
            <Tip>atitude conta MUITO (às vezes mais que habilidade)</Tip>
          </Subsection>
        </Card>

        <Card icon={Ban} title="🚫 O que NÃO fazer" tone="danger">
          <List
            items={[
              "Reclamar ou discutir",
              "Jogar de forma individualista",
              "Desrespeitar colegas ou comissão",
              "Desistir no meio da atividade",
            ]}
          />
        </Card>

        <Card icon={MessageCircle} title="💬 Como se destacar na peneira">
          <List
            items={[
              "Seja esforçado o tempo todo",
              "Demonstre vontade",
              "Escute e siga instruções",
              "Mantenha atitude positiva",
            ]}
          />
          <Callout tone="info" icon={HeartHandshake} title="Lembre-se">
            Nem sempre o melhor tecnicamente é escolhido — quem tem atitude e disciplina sai
            na frente.
          </Callout>
        </Card>

        <Card icon={Flag} title="🏁 Após a peneira">
          <List
            items={[
              "Aguarde o resultado pelos canais informados",
              "Continue treinando",
              "Não desista caso não seja selecionado",
            ]}
          />
        </Card>

        <div className="mt-6 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-gold p-8 text-center text-primary-foreground">
          <Star className="mx-auto h-10 w-10" />
          <h3 className="mt-3 font-display text-2xl font-extrabold">Mensagem final</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium">
            A peneira é mais do que um teste — é uma oportunidade de crescimento.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm font-bold">
            Dê o seu melhor, respeite todos e aproveite a experiência. ⚽
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/peneiras"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-gold-light"
          >
            <Sparkles className="h-4 w-4" />
            Ver peneiras disponíveis
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={
        "mt-6 rounded-2xl border bg-card p-6 shadow-card sm:p-8 " +
        (tone === "danger" ? "border-destructive/40" : "border-border")
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={
            "flex h-11 w-11 items-center justify-center rounded-xl " +
            (tone === "danger"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary")
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Subsection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-xl border border-border bg-bg2 p-4">
      <h3 className="font-display font-bold text-foreground">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
      👉 Dica: {children}
    </p>
  );
}

function Callout({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "warning" | "info";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "warning"
      ? "border-gold-dark/40 bg-gold/10 text-gold-light"
      : "border-blue-light/40 bg-blue-light/10 text-blue-light";
  return (
    <div className={"mt-4 flex gap-3 rounded-xl border p-4 " + styles}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="text-sm">
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-foreground/80">{children}</p>
      </div>
    </div>
  );
}

// Suppress unused warnings for icons referenced via JSX prop
void Users;
void Smile;
