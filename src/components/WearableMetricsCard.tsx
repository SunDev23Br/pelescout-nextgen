import { useEffect, useState } from "react";
import { Activity, Footprints, HeartPulse, Loader2, MapPin, Watch, Zap } from "lucide-react";
import { getAthleteMetrics, summarize, type WearableDailyMetric } from "@/lib/wearables";

interface Props {
  atletaId: string;
  /** If true, shows the empty state for the athlete viewer; otherwise hides if no data. */
  showEmpty?: boolean;
}

function formatRelative(d: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `${h}h atrás`;
  const days = Math.floor(h / 24);
  return `${days}d atrás`;
}

export function WearableMetricsCard({ atletaId, showEmpty = true }: Props) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<WearableDailyMetric[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAthleteMetrics(atletaId, 7)
      .then((m) => !cancelled && setMetrics(m))
      .catch(() => !cancelled && setMetrics([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  const s = summarize(metrics);
  const lastDay = metrics.length ? metrics[metrics.length - 1].metric_date : null;

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <Header />
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (metrics.length === 0) {
    if (!showEmpty) return null;
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <Header />
        <p className="mt-4 text-sm italic text-muted-foreground">
          Este atleta ainda não conectou um dispositivo vestível. As métricas
          aparecerão aqui quando ele conectar um smartwatch via Google Fit.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <Header />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={HeartPulse}
          label="BPM médio"
          value={s.avgHeartRate != null ? `${s.avgHeartRate}` : "—"}
          suffix={s.avgHeartRate != null ? "bpm" : undefined}
        />
        <Stat
          icon={Footprints}
          label="Passos/dia"
          value={s.avgSteps != null ? s.avgSteps.toLocaleString("pt-BR") : "—"}
        />
        <Stat
          icon={MapPin}
          label="Distância/dia"
          value={s.avgDistanceKm != null ? `${s.avgDistanceKm}` : "—"}
          suffix={s.avgDistanceKm != null ? "km" : undefined}
        />
        <Stat
          icon={Zap}
          label="Vel. média"
          value={s.avgSpeedKmh != null ? `${s.avgSpeedKmh}` : "—"}
          suffix={s.avgSpeedKmh != null ? "km/h" : undefined}
        />
      </div>
      <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Activity className="h-3 w-3" />
        Últimos {s.totalDays} dia(s) · atualizado {formatRelative(lastDay)}
      </p>
    </section>
  );
}

function Header() {
  return (
    <div>
      <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
        <Watch className="mr-2 inline h-3 w-3" /> Métricas do wearable
      </h2>
      <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
    </div>
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
    <div className="rounded-xl border border-border bg-bg2 px-3 py-3">
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
