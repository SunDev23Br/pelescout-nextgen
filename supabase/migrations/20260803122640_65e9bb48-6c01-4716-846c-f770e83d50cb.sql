CREATE TABLE public.scout_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cargo text,
  especialidades text[] NOT NULL DEFAULT '{}',
  posicoes text[] NOT NULL DEFAULT '{}',
  competicoes text[] NOT NULL DEFAULT '{}',
  experiencia jsonb NOT NULL DEFAULT '[]'::jsonb,
  instagram text,
  linkedin text,
  whatsapp text,
  email_contato text,
  disponivel boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scout_profiles TO authenticated;
GRANT SELECT ON public.scout_profiles TO anon;
GRANT ALL ON public.scout_profiles TO service_role;

ALTER TABLE public.scout_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scout_profiles public read"
  ON public.scout_profiles FOR SELECT
  USING (true);

CREATE POLICY "scout_profiles owner insert"
  ON public.scout_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scout_profiles owner update"
  ON public.scout_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scout_profiles owner delete"
  ON public.scout_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_scout_profiles
  BEFORE UPDATE ON public.scout_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();