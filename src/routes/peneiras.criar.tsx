import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Calculator, Lock, Globe2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calcularJogos, calcularVagas } from "@/lib/mock-data";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/peneiras/criar")({
  head: () => ({
    meta: [
      { title: "Criar peneira — Pelé Next Gen" },
      { name: "description", content: "Cadastre uma nova peneira oficial." },
    ],
  }),
  component: CriarPeneiraPage,
});

function CriarPeneiraPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    cidade: "",
    estado: "",
    local: "",
    data: "",
    horaInicio: "15:00",
    horaFim: "21:00",
    duracaoJogoMin: 30,
    participantesPorJogo: 22,
    limiteInscricao: "",
    visibilidade: "publica" as "publica" | "privada",
    descricao: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const totalJogos = useMemo(
    () => calcularJogos(form.horaInicio, form.horaFim, form.duracaoJogoMin),
    [form.horaInicio, form.horaFim, form.duracaoJogoMin],
  );
  const totalVagas = useMemo(
    () =>
      calcularVagas(
        form.horaInicio,
        form.horaFim,
        form.duracaoJogoMin,
        form.participantesPorJogo,
      ),
    [form.horaInicio, form.horaFim, form.duracaoJogoMin, form.participantesPorJogo],
  );

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: false }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!form.titulo) newErrors.titulo = true;
    if (!form.cidade) newErrors.cidade = true;
    if (!form.estado) newErrors.estado = true;
    if (!form.local) newErrors.local = true;
    if (!form.data) newErrors.data = true;
    if (!form.limiteInscricao) newErrors.limiteInscricao = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    if (totalJogos <= 0) {
      toast.error("Janela de horários inválida — verifique início, fim e duração.");
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      toast.success(
        `Peneira "${form.titulo}" criada com ${totalJogos} jogos e ${totalVagas} vagas!`,
      );
      navigate({ to: "/peneiras" });
    }, 700);
  }

  if (user && user.role !== "admin") {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="font-display text-2xl font-bold">Acesso restrito</h2>
          <p className="mt-2 text-muted-foreground">
            Apenas administradores podem criar peneiras.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to="/peneiras"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para peneiras
      </Link>

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Criar peneira
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Nova peneira oficial
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Defina horários, duração dos jogos e visibilidade. O sistema calcula automaticamente
          quantos jogos e vagas serão criados.
        </p>
      </header>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Informações básicas">
            <Grid>
              <Field label="Título *" full>
                <Input
                  value={form.titulo}
                  onChange={(e) => update("titulo", e.target.value)}
                  placeholder="Ex: Peneira Sub-17 — CT Rei Pelé"
                />
              </Field>
              <Field label="Cidade *">
                <Input
                  value={form.cidade}
                  onChange={(e) => update("cidade", e.target.value)}
                  placeholder="Santos"
                />
              </Field>
              <Field label="Estado *">
                <Input
                  value={form.estado}
                  onChange={(e) => update("estado", e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </Field>
              <Field label="Local *" full>
                <Input
                  value={form.local}
                  onChange={(e) => update("local", e.target.value)}
                  placeholder="CT Rei Pelé — Vila Belmiro"
                />
              </Field>
              <Field label="Descrição" full>
                <Textarea
                  value={form.descricao}
                  onChange={(e) => update("descricao", e.target.value)}
                  rows={3}
                  placeholder="Detalhes da seletiva, categorias, presença de olheiros..."
                  maxLength={500}
                />
              </Field>
            </Grid>
          </Card>

          <Card title="Programação">
            <Grid>
              <Field label="Data da peneira *">
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => update("data", e.target.value)}
                />
              </Field>
              <Field label="Limite para inscrição *">
                <Input
                  type="datetime-local"
                  value={form.limiteInscricao}
                  onChange={(e) => update("limiteInscricao", e.target.value)}
                />
              </Field>
              <Field label="Início (campo disponível)">
                <Input
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => update("horaInicio", e.target.value)}
                />
              </Field>
              <Field label="Fim (campo disponível)">
                <Input
                  type="time"
                  value={form.horaFim}
                  onChange={(e) => update("horaFim", e.target.value)}
                />
              </Field>
              <Field label="Duração de cada jogo (min)">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={form.duracaoJogoMin}
                  onChange={(e) =>
                    update("duracaoJogoMin", Math.max(5, Number(e.target.value) || 0))
                  }
                />
              </Field>
              <Field label="Participantes por jogo">
                <Input
                  type="number"
                  min={2}
                  max={30}
                  value={form.participantesPorJogo}
                  onChange={(e) =>
                    update("participantesPorJogo", Math.max(2, Number(e.target.value) || 0))
                  }
                />
              </Field>
            </Grid>
          </Card>

          <Card title="Visibilidade">
            <div className="grid gap-3 sm:grid-cols-2">
              <VisOption
                active={form.visibilidade === "publica"}
                onClick={() => update("visibilidade", "publica")}
                icon={<Globe2 className="h-5 w-5" />}
                title="Pública"
                desc="Aparece para qualquer atleta cadastrado."
              />
              <VisOption
                active={form.visibilidade === "privada"}
                onClick={() => update("visibilidade", "privada")}
                icon={<Lock className="h-5 w-5" />}
                title="Privada"
                desc="Apenas atletas convidados conseguem se inscrever."
              />
            </div>
          </Card>
        </div>

        {/* Painel lateral com cálculo */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-card">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Calculator className="h-4 w-4" />
              Cálculo automático
            </p>
            <h3 className="mt-3 font-display text-base font-bold">Resumo da peneira</h3>

            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Janela do campo">
                {form.horaInicio} → {form.horaFim}
              </Row>
              <Row label="Duração / jogo">{form.duracaoJogoMin} min</Row>
              <Row label="Participantes / jogo">{form.participantesPorJogo}</Row>
            </dl>

            <div className="mt-5 rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Jogos no dia
              </p>
              <p className="font-display text-3xl font-extrabold text-gradient-gold">
                {totalJogos}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Vagas totais
              </p>
              <p className="font-display text-3xl font-extrabold text-gradient-gold">
                {totalVagas}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {totalJogos} jogos × {form.participantesPorJogo} atletas
              </p>
            </div>

            <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>
              {loading ? "Criando..." : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Publicar peneira
                </>
              )}
            </Button>
          </div>
        </aside>
      </form>
    </AppLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="mb-5 font-display text-base font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={"space-y-2 " + (full ? "sm:col-span-2" : "")}>
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

function VisOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors " +
        (active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-bg2 text-muted-foreground hover:text-foreground")
      }
    >
      <div className={active ? "text-primary" : ""}>{icon}</div>
      <p className="font-display font-bold text-foreground">{title}</p>
      <p className="text-xs">{desc}</p>
    </button>
  );
}
