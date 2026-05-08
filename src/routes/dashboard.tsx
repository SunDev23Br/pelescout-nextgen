import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Users,
  Star,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { peneiras, candidatos } from "@/lib/mock-data";

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { name?: string; fill?: string };
};

function AccessibleTooltip({
  active,
  payload,
  label,
  unitLabel,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unitLabel: string;
  valueSuffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      role="tooltip"
      aria-live="polite"
      className="rounded-xl border-2 border-primary/70 bg-[#0a1426] px-4 py-3 shadow-2xl ring-1 ring-black/40"
      style={{ minWidth: 180 }}
    >
      {label !== undefined && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {label}
        </p>
      )}
      <ul className="flex flex-col gap-1.5">
        {payload.map((entry, i) => {
          const name = entry.name ?? entry.payload?.name ?? unitLabel;
          const swatch = entry.color ?? entry.payload?.fill ?? "#d4af37";
          return (
            <li key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full ring-2 ring-white/20"
                  style={{ background: swatch }}
                />
                {name}
              </span>
              <span className="text-base font-bold tabular-nums text-white">
                {entry.value}
                {valueSuffix}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pelé Next Gen" },
      { name: "description", content: "Visão geral do desempenho dos candidatos." },
    ],
  }),
  component: Dashboard,
});

const inscricoesData = [
  { mes: "Jan", inscricoes: 120 },
  { mes: "Fev", inscricoes: 180 },
  { mes: "Mar", inscricoes: 240 },
  { mes: "Abr", inscricoes: 310 },
  { mes: "Mai", inscricoes: 420 },
  { mes: "Jun", inscricoes: 380 },
];

const posicoesData = [
  { name: "Atacante", value: 28 },
  { name: "Meia", value: 22 },
  { name: "Zagueiro", value: 18 },
  { name: "Lateral", value: 15 },
  { name: "Volante", value: 12 },
  { name: "Goleiro", value: 5 },
];

const COLORS = ["#d4af37", "#1a7fd4", "#2ecc71", "#f0d060", "#005baa", "#8a9bb5"];

const desempenhoData = [
  { criterio: "Técnica", media: 7.8 },
  { criterio: "Físico", media: 7.4 },
  { criterio: "Tático", media: 7.1 },
  { criterio: "Psicológico", media: 8.0 },
];

function Dashboard() {
  const total = candidatos.length;
  const aprovados = candidatos.filter((c) => c.status === "aprovado").length;
  const pendentes = candidatos.filter((c) => c.status === "pendente").length;
  const peneirasAtivas = peneiras.filter((p) => p.status !== "encerrada").length;

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Painel administrativo
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Visão geral
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe inscrições, peneiras e desempenho dos candidatos em tempo real.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          icon={Trophy}
          label="Peneiras ativas"
          value={peneirasAtivas}
          delta="+2 este mês"
        />
        <KPI
          icon={Users}
          label="Atletas inscritos"
          value={total}
          delta="+18% vs mês anterior"
        />
        <KPI
          icon={Star}
          label="Atletas aprovados"
          value={aprovados}
          delta="Taxa 24%"
        />
        <KPI
          icon={TrendingUp}
          label="Avaliações pendentes"
          value={pendentes}
          delta="Próx. peneira em 14 dias"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Inscrições mensais"
          subtitle="Crescimento de candidatos por mês"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={inscricoesData}>
              <defs>
                <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f0d060" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mes" stroke="#8a9bb5" fontSize={12} />
              <YAxis stroke="#8a9bb5" fontSize={12} />
              <Tooltip
                cursor={{ fill: "rgba(212,175,55,0.08)" }}
                content={<AccessibleTooltip unitLabel="Inscrições" />}
              />
              <Line
                type="monotone"
                dataKey="inscricoes"
                stroke="url(#lineGold)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#d4af37" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Posições" subtitle="Distribuição dos atletas">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={posicoesData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
              >
                {posicoesData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<AccessibleTooltip unitLabel="Atletas" />}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 12, color: "#8a9bb5" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Médias por critério"
          subtitle="Avaliação dos candidatos"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={desempenhoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="criterio" stroke="#8a9bb5" fontSize={12} />
              <YAxis stroke="#8a9bb5" fontSize={12} domain={[0, 10]} />
              <Tooltip
                cursor={{ fill: "rgba(212,175,55,0.08)" }}
                content={
                  <AccessibleTooltip unitLabel="Média" valueSuffix=" / 10" />
                }
              />
              <Bar dataKey="media" fill="#d4af37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Próximas peneiras</h3>
            <Link
              to="/peneiras"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-gold-light"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {peneiras
              .filter((p) => p.status !== "encerrada")
              .slice(0, 4)
              .map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-bg2 p-3"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg">
                    <img src={p.imagem} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.cidade}/{p.estado} ·{" "}
                      {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </AppLayout>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-success">{delta}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-border bg-card p-6 shadow-card " + (className ?? "")
      }
    >
      <div className="mb-4">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
