// Client-side helpers for wearable integration.
import { supabase } from "@/integrations/supabase/client";

export type WearableProvider = "google_fit" | "mock";

export interface WearableConnectionRow {
  id: string;
  provider: WearableProvider;
  last_sync_at: string | null;
  last_sync_error: string | null;
  created_at: string;
}

export interface WearableDailyMetric {
  metric_date: string;
  provider: WearableProvider;
  steps: number | null;
  distance_m: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  heart_rate_resting: number | null;
  active_minutes: number | null;
  speed_avg_kmh: number | null;
}

async function bearer() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export async function startWearableOAuth(provider: WearableProvider): Promise<string> {
  const token = await bearer();
  const res = await fetch("/api/wearables/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ provider, redirect: "/perfil" }),
  });
  if (!res.ok) throw new Error(`Falha ao iniciar OAuth: ${res.status} ${await res.text()}`);
  const { url } = (await res.json()) as { url: string };
  return url;
}

export async function syncWearablesNow(): Promise<{ synced: number }> {
  const token = await bearer();
  const res = await fetch("/api/wearables/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Sync falhou: ${res.status}`);
  return (await res.json()) as { synced: number };
}

export async function listMyConnections(): Promise<WearableConnectionRow[]> {
  const { data, error } = await supabase
    .from("wearable_connections")
    .select("id, provider, last_sync_at, last_sync_error, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WearableConnectionRow[];
}

export async function disconnectWearable(id: string): Promise<void> {
  const { error } = await supabase.from("wearable_connections").delete().eq("id", id);
  if (error) throw error;
}

export async function getAthleteMetrics(
  userId: string,
  days = 7
): Promise<WearableDailyMetric[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const { data, error } = await supabase
    .from("wearable_daily_metrics")
    .select(
      "metric_date, provider, steps, distance_m, heart_rate_avg, heart_rate_max, heart_rate_resting, active_minutes, speed_avg_kmh"
    )
    .eq("user_id", userId)
    .gte("metric_date", since.toISOString().slice(0, 10))
    .order("metric_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WearableDailyMetric[];
}

export function summarize(metrics: WearableDailyMetric[]) {
  const num = (arr: (number | null)[]) => arr.filter((v): v is number => v != null);
  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
  const sum = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) : null);
  const steps = num(metrics.map((m) => m.steps));
  const dist = num(metrics.map((m) => m.distance_m));
  const hr = num(metrics.map((m) => m.heart_rate_avg));
  const sp = num(metrics.map((m) => m.speed_avg_kmh));
  return {
    avgHeartRate: avg(hr),
    avgSteps: avg(steps),
    avgDistanceKm: dist.length ? Number((sum(dist)! / dist.length / 1000).toFixed(2)) : null,
    avgSpeedKmh: sp.length ? Number((sp.reduce((a, b) => a + b, 0) / sp.length).toFixed(2)) : null,
    totalDays: metrics.length,
  };
}
