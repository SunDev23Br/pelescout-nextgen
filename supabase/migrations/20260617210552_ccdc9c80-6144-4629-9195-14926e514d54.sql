-- Provider enum
CREATE TYPE public.wearable_provider AS ENUM ('google_fit', 'fitbit');

-- Connections table (OAuth tokens)
CREATE TABLE public.wearable_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider public.wearable_provider NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  scopes text,
  external_user_id text,
  last_sync_at timestamptz,
  last_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wearable_connections TO authenticated;
GRANT ALL ON public.wearable_connections TO service_role;

ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Atleta gerencia própria conexão"
  ON public.wearable_connections FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Suporte vê todas conexões"
  ON public.wearable_connections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'suporte'));

CREATE TRIGGER set_updated_at_wearable_connections
  BEFORE UPDATE ON public.wearable_connections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Daily metrics table
CREATE TABLE public.wearable_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider public.wearable_provider NOT NULL,
  metric_date date NOT NULL,
  heart_rate_avg integer,
  heart_rate_max integer,
  heart_rate_resting integer,
  steps integer,
  distance_m integer,
  speed_avg_kmh numeric(5,2),
  active_minutes integer,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, metric_date)
);

CREATE INDEX wearable_daily_metrics_user_date_idx
  ON public.wearable_daily_metrics (user_id, metric_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wearable_daily_metrics TO authenticated;
GRANT ALL ON public.wearable_daily_metrics TO service_role;

ALTER TABLE public.wearable_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Atleta vê próprias métricas"
  ON public.wearable_daily_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Olheiros e clubes veem métricas dos atletas"
  ON public.wearable_daily_metrics FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'clube')
    OR public.has_role(auth.uid(), 'suporte')
  );

CREATE POLICY "Atleta insere próprias métricas"
  ON public.wearable_daily_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atleta atualiza próprias métricas"
  ON public.wearable_daily_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atleta apaga próprias métricas"
  ON public.wearable_daily_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_wearable_daily_metrics
  BEFORE UPDATE ON public.wearable_daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
