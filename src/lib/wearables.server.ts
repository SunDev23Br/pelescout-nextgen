// Server-only helpers for wearable integrations (Google Fit).
// Do NOT import this from any client/component code.

import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import type { Database } from "@/integrations/supabase/types";

type Provider = "google_fit";

const HMAC_SECRET = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function getRedirectUri(origin: string, provider: Provider) {
  return `${origin}/api/wearables/callback/${provider}`;
}

// ---------- HMAC-signed state ----------

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export function signState(payload: { uid: string; provider: Provider; redirect: string }) {
  const body = { ...payload, exp: Date.now() + 10 * 60 * 1000, n: randomBytes(8).toString("hex") };
  const data = b64url(Buffer.from(JSON.stringify(body)));
  const sig = b64url(createHmac("sha256", HMAC_SECRET()).update(data).digest());
  return `${data}.${sig}`;
}

export function verifyState(state: string): { uid: string; provider: Provider; redirect: string } | null {
  try {
    const [data, sig] = state.split(".");
    if (!data || !sig) return null;
    const expected = b64url(createHmac("sha256", HMAC_SECRET()).update(data).digest());
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(b64urlDecode(data).toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return { uid: payload.uid, provider: payload.provider, redirect: payload.redirect };
  } catch {
    return null;
  }
}

// ---------- Supabase admin ----------

export function getAdmin() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getUserIdFromBearer(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const client = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

// ---------- Google Fit ----------

export const GOOGLE_FIT_SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.location.read",
].join(" ");

export function buildGoogleFitAuthUrl(state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_FIT_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleFitCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
      client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

export async function refreshGoogleFitToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
      client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google refresh failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { access_token: string; expires_in: number };
}

async function ensureFreshToken(conn: {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  id: string;
}) {
  const expSoon = !conn.expires_at || new Date(conn.expires_at).getTime() - Date.now() < 60_000;
  if (!expSoon) return conn.access_token;
  if (!conn.refresh_token) throw new Error("Sem refresh_token; reconecte o dispositivo.");
  const refreshed = await refreshGoogleFitToken(conn.refresh_token);
  const newExp = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  const admin = getAdmin();
  await admin
    .from("wearable_connections")
    .update({ access_token: refreshed.access_token, expires_at: newExp })
    .eq("id", conn.id);
  return refreshed.access_token;
}

type DailyMetric = {
  date: string; // YYYY-MM-DD
  steps: number | null;
  distance_m: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  active_minutes: number | null;
};

function dayUtcMillis(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
function isoDate(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

async function fetchGoogleFitDaily(accessToken: string, days = 7): Promise<DailyMetric[]> {
  const end = dayUtcMillis(new Date()) + 86_400_000; // tomorrow 00:00 UTC
  const start = end - days * 86_400_000;
  const body = {
    aggregateBy: [
      { dataTypeName: "com.google.step_count.delta" },
      { dataTypeName: "com.google.distance.delta" },
      { dataTypeName: "com.google.heart_rate.bpm" },
      { dataTypeName: "com.google.active_minutes" },
    ],
    bucketByTime: { durationMillis: 86_400_000 },
    startTimeMillis: start,
    endTimeMillis: end,
  };
  const res = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Google Fit aggregate failed: ${res.status} ${await res.text()}`);
  const json: any = await res.json();
  const out: DailyMetric[] = [];
  for (const bucket of json.bucket ?? []) {
    const date = isoDate(Number(bucket.startTimeMillis));
    let steps: number | null = null;
    let distance_m: number | null = null;
    let hrAvgSum = 0,
      hrAvgCount = 0,
      hrMax: number | null = null;
    let active = 0;
    for (const ds of bucket.dataset ?? []) {
      for (const p of ds.point ?? []) {
        const type = ds.dataSourceId ?? "";
        for (const v of p.value ?? []) {
          if (type.includes("step_count")) steps = (steps ?? 0) + (v.intVal ?? 0);
          else if (type.includes("distance")) distance_m = (distance_m ?? 0) + (v.fpVal ?? 0);
          else if (type.includes("heart_rate")) {
            if (v.fpVal != null) {
              hrAvgSum += v.fpVal;
              hrAvgCount++;
              hrMax = Math.max(hrMax ?? 0, v.fpVal);
            }
          } else if (type.includes("active_minutes")) active += v.intVal ?? 0;
        }
      }
    }
    out.push({
      date,
      steps,
      distance_m: distance_m != null ? Math.round(distance_m) : null,
      heart_rate_avg: hrAvgCount ? Math.round(hrAvgSum / hrAvgCount) : null,
      heart_rate_max: hrMax != null ? Math.round(hrMax) : null,
      active_minutes: active || null,
    });
  }
  return out;
}

export async function syncConnection(connectionId: string) {
  const admin = getAdmin();
  const { data: conn, error } = await admin
    .from("wearable_connections")
    .select("id, user_id, provider, access_token, refresh_token, expires_at")
    .eq("id", connectionId)
    .maybeSingle();
  if (error || !conn) throw new Error("Conexão não encontrada");

  try {
    const token = await ensureFreshToken(conn);
    const daily = await fetchGoogleFitDaily(token, 7);
    const rows = daily.map((d) => {
      const speed = d.distance_m && d.active_minutes && d.active_minutes > 0
        ? Number(((d.distance_m / 1000) / (d.active_minutes / 60)).toFixed(2))
        : null;
      return {
        user_id: conn.user_id,
        provider: conn.provider,
        metric_date: d.date,
        steps: d.steps,
        distance_m: d.distance_m,
        heart_rate_avg: d.heart_rate_avg,
        heart_rate_max: d.heart_rate_max,
        heart_rate_resting: null,
        active_minutes: d.active_minutes,
        speed_avg_kmh: speed,
        raw_payload: d as any,
      };
    });
    if (rows.length > 0) {
      const { error: upErr } = await admin
        .from("wearable_daily_metrics")
        .upsert(rows, { onConflict: "user_id,provider,metric_date" });
      if (upErr) throw upErr;
    }
    await admin
      .from("wearable_connections")
      .update({ last_sync_at: new Date().toISOString(), last_sync_error: null })
      .eq("id", conn.id);
    return { ok: true, days: rows.length };
  } catch (e: any) {
    await admin
      .from("wearable_connections")
      .update({ last_sync_error: String(e?.message ?? e).slice(0, 500) })
      .eq("id", conn.id);
    throw e;
  }
}

export async function saveConnection(params: {
  userId: string;
  provider: Provider;
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  scopes: string;
}) {
  const admin = getAdmin();
  const expires_at = new Date(Date.now() + params.expiresIn * 1000).toISOString();
  const { data, error } = await admin
    .from("wearable_connections")
    .upsert(
      {
        user_id: params.userId,
        provider: params.provider,
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
        expires_at,
        scopes: params.scopes,
      },
      { onConflict: "user_id,provider" }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
