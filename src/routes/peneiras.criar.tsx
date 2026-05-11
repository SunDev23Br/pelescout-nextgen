import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Calculator, Lock, Globe2, Clock, CalendarIcon, Hash, Users } from "lucide-react";
import { format as formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollPicker, pad2, range } from "@/components/ScrollPicker";
import { BR_STATES } from "@/lib/br-states";
import { cn } from "@/lib/utils";
import { calcularJogos, calcularVagas } from "@/lib/mock-data";
import { useSession } from "@/lib/session";
import { criarPeneira } from "@/lib/peneiras.functions";
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
    categorias: [] as string[],
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
    if (form.categorias.length === 0) newErrors.categorias = true;
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
    (async () => {
      try {
        await criarPeneira({
          titulo: form.titulo,
          cidade: form.cidade,
          estado: form.estado,
          local: form.local,
          data: form.data,
          horaInicio: form.horaInicio,
          horaFim: form.horaFim,
          duracaoJogoMin: form.duracaoJogoMin,
          participantesPorJogo: form.participantesPorJogo,
          limiteInscricao: form.limiteInscricao,
          visibilidade: form.visibilidade,
          descricao: form.descricao,
          categorias: form.categorias,
        });
        toast.success(
          `Peneira "${form.titulo}" criada com ${totalJogos} jogos e ${totalVagas} vagas!`,
        );
        navigate({ to: "/peneiras" });
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar peneira.",
        );
        setLoading(false);
      }
    })();
  }

  if (user && user.role !== "admin" && user.role !== "clube") {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="font-display text-2xl font-bold">Acesso restrito</h2>
          <p className="mt-2 text-muted-foreground">
            Apenas administradores e clubes podem criar peneiras.
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
              <Field label="Título *" full error={errors.titulo}>
                <Input
                  value={form.titulo}
                  onChange={(e) => update("titulo", e.target.value)}
                  placeholder="Ex: Peneira Sub-17 — CT Rei Pelé"
                  className={errors.titulo ? "border-error ring-2 ring-error/40" : ""}
                />
              </Field>
              <Field label="Cidade *" error={errors.cidade}>
                <Input
                  value={form.cidade}
                  onChange={(e) => update("cidade", e.target.value)}
                  placeholder="Santos"
                  className={errors.cidade ? "border-error ring-2 ring-error/40" : ""}
                />
              </Field>
              <Field label="Estado *" error={errors.estado}>
                <Select value={form.estado} onValueChange={(v) => update("estado", v)}>
                  <SelectTrigger
                    className={errors.estado ? "border-error ring-2 ring-error/40" : ""}
                    aria-label="Estado"
                  >
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BR_STATES.map((s) => (
                      <SelectItem key={s.uf} value={s.uf}>
                        {s.uf} — {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Local *" full error={errors.local}>
                <Input
                  value={form.local}
                  onChange={(e) => update("local", e.target.value)}
                  placeholder="CT Rei Pelé — Vila Belmiro"
                  className={errors.local ? "border-error ring-2 ring-error/40" : ""}
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

          <Card title="Categorias">
            <CategoriasSelector
              value={form.categorias}
              onChange={(v) => update("categorias", v)}
              error={errors.categorias}
            />
          </Card>

          <Card title="Programação">
            <Grid>
              <Field label="Data da peneira *" error={errors.data}>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => update("data", e.target.value)}
                  className={errors.data ? "border-error ring-2 ring-error/40" : ""}
                />
              </Field>
              <Field label="Limite para inscrição *" error={errors.limiteInscricao}>
                <DateTimePicker
                  value={form.limiteInscricao}
                  onChange={(v) => update("limiteInscricao", v)}
                  error={errors.limiteInscricao}
                />
              </Field>
              <Field label="Início (campo disponível)">
                <TimePicker
                  value={form.horaInicio}
                  onChange={(v) => update("horaInicio", v)}
                  ariaLabel="Início do campo disponível"
                />
              </Field>
              <Field label="Fim (campo disponível)">
                <TimePicker
                  value={form.horaFim}
                  onChange={(v) => update("horaFim", v)}
                  ariaLabel="Fim do campo disponível"
                />
              </Field>
              <Field label="Duração de cada jogo (min)">
                <NumberPicker
                  values={range(5, 120, 5)}
                  value={form.duracaoJogoMin}
                  onChange={(v) => update("duracaoJogoMin", v)}
                  ariaLabel="Duração em minutos"
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  suffix="min"
                />
              </Field>
              <Field label="Participantes por jogo">
                <NumberPicker
                  values={range(2, 30, 1)}
                  value={form.participantesPorJogo}
                  onChange={(v) => update("participantesPorJogo", v)}
                  ariaLabel="Participantes por jogo"
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  suffix="atletas"
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
                desc="Todos os olheiros têm acesso à peneira."
              />
              <VisOption
                active={form.visibilidade === "privada"}
                onClick={() => update("visibilidade", "privada")}
                icon={<Lock className="h-5 w-5" />}
                title="Privada"
                desc="Apenas olheiros convidados via link têm acesso. Atletas veem normalmente."
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

            <Button
              type="submit"
              className="mt-6 w-full"
              size="lg"
              disabled={loading}
              variant={Object.values(errors).some(Boolean) ? "error" : "default"}
            >
              {loading ? "Criando..." : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {Object.values(errors).some(Boolean) ? "Preencha os campos obrigatórios" : "Publicar peneira"}
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
  error,
  children,
}: {
  label: string;
  full?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={"space-y-2 " + (full ? "sm:col-span-2" : "")}>
      <Label className={"text-sm font-semibold " + (error ? "text-error" : "")}>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-error">Campo obrigatório.</p>}
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

function parseTime(v: string): { h: number; m: number } {
  const [hStr, mStr] = (v || "00:00").split(":");
  return { h: Number(hStr) || 0, m: Number(mStr) || 0 };
}

function TimePicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  const { h, m } = parseTime(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-mono text-base"
          aria-label={ariaLabel}
        >
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          {pad2(h)}:{pad2(m)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 pointer-events-auto" align="start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {ariaLabel}
        </p>
        <div className="flex items-center gap-2">
          <ScrollPicker
            values={range(0, 23)}
            value={h}
            onChange={(nh) => onChange(`${pad2(nh)}:${pad2(m)}`)}
            ariaLabel="Hora"
            format={pad2}
            className="w-16"
          />
          <span className="font-display text-2xl font-bold text-muted-foreground">:</span>
          <ScrollPicker
            values={range(0, 55, 5)}
            value={m - (m % 5)}
            onChange={(nm) => onChange(`${pad2(h)}:${pad2(nm)}`)}
            ariaLabel="Minuto"
            format={pad2}
            className="w-16"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DateTimePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const [datePart, timePart] = (value || "").split("T");
  const date = datePart ? new Date(datePart + "T00:00:00") : undefined;
  const { h, m } = parseTime(timePart || "12:00");

  function setDate(d: Date | undefined) {
    if (!d) return;
    const dStr = formatDate(d, "yyyy-MM-dd");
    onChange(`${dStr}T${pad2(h)}:${pad2(m)}`);
  }
  function setTime(nh: number, nm: number) {
    const dStr = datePart || formatDate(new Date(), "yyyy-MM-dd");
    onChange(`${dStr}T${pad2(nh)}:${pad2(nm)}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-error ring-2 ring-error/40",
          )}
          aria-label="Limite para inscrição"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            <span className="font-mono">
              {date ? formatDate(date, "dd/MM/yyyy", { locale: ptBR }) : "—"} {pad2(h)}:{pad2(m)}
            </span>
          ) : (
            <span>Escolha data e hora</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 pointer-events-auto" align="start">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={ptBR}
            className={cn("p-0 pointer-events-auto")}
          />
          <div className="flex flex-col">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Horário (24h)
            </p>
            <div className="flex items-center gap-2">
              <ScrollPicker
                values={range(0, 23)}
                value={h}
                onChange={(nh) => setTime(nh, m)}
                ariaLabel="Hora"
                format={pad2}
                className="w-16"
              />
              <span className="font-display text-2xl font-bold text-muted-foreground">:</span>
              <ScrollPicker
                values={range(0, 55, 5)}
                value={m - (m % 5)}
                onChange={(nm) => setTime(h, nm)}
                ariaLabel="Minuto"
                format={pad2}
                className="w-16"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NumberPicker({
  values,
  value,
  onChange,
  ariaLabel,
  icon,
  suffix,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  icon?: React.ReactNode;
  suffix?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-mono text-base"
          aria-label={ariaLabel}
        >
          {icon ?? <Hash className="h-4 w-4 text-muted-foreground" />}
          <span className="ml-2">
            {value}
            {suffix ? ` ${suffix}` : ""}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 pointer-events-auto" align="start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {ariaLabel}
        </p>
        <ScrollPicker
          values={values}
          value={value}
          onChange={onChange}
          ariaLabel={ariaLabel}
          className="w-24"
        />
      </PopoverContent>
    </Popover>
  );
}
