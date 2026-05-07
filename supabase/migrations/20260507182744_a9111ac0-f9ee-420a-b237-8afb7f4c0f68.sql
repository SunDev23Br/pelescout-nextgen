
-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('atleta', 'admin', 'clube');
CREATE TYPE public.posicao AS ENUM ('Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante');
CREATE TYPE public.status_peneira AS ENUM ('aberta', 'em_andamento', 'encerrada');
CREATE TYPE public.visibilidade AS ENUM ('publica', 'privada');
CREATE TYPE public.status_candidato AS ENUM ('pendente', 'avaliado', 'aprovado', 'reprovado');
CREATE TYPE public.pe_dominante AS ENUM ('Destro', 'Canhoto');

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  nome_clube TEXT,
  cnpj TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========== USER_ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ========== PENEIRAS ==========
CREATE TABLE public.peneiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  local TEXT NOT NULL,
  data DATE NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  duracao_jogo_min INT NOT NULL DEFAULT 30,
  participantes_por_jogo INT NOT NULL DEFAULT 22,
  limite_inscricao TIMESTAMPTZ NOT NULL,
  inscritos INT NOT NULL DEFAULT 0,
  categorias TEXT[] NOT NULL DEFAULT '{}',
  status status_peneira NOT NULL DEFAULT 'aberta',
  visibilidade visibilidade NOT NULL DEFAULT 'publica',
  invite_token TEXT,
  imagem TEXT,
  descricao TEXT,
  organizador TEXT NOT NULL DEFAULT 'Pelé Next Gen',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peneiras ENABLE ROW LEVEL SECURITY;

-- ========== CANDIDATOS ==========
CREATE TABLE public.candidatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  peneira_id UUID NOT NULL REFERENCES public.peneiras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  idade INT NOT NULL,
  posicao posicao NOT NULL,
  cidade TEXT NOT NULL,
  altura INT NOT NULL,
  peso INT NOT NULL,
  pe pe_dominante NOT NULL DEFAULT 'Destro',
  avatar TEXT,
  email TEXT NOT NULL,
  celular TEXT NOT NULL,
  status status_candidato NOT NULL DEFAULT 'pendente',
  nota_geral NUMERIC(3,1),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;

-- ========== AVALIACOES ==========
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  avaliador_id UUID REFERENCES auth.users(id),
  tecnica NUMERIC(3,1),
  fisico NUMERIC(3,1),
  tatico NUMERIC(3,1),
  psicologico NUMERIC(3,1),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- ========== CONTATOS_DESBLOQUEADOS ==========
CREATE TABLE public.contatos_desbloqueados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clube_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clube_id, candidato_id)
);
ALTER TABLE public.contatos_desbloqueados ENABLE ROW LEVEL SECURITY;

-- ========== TRIGGER: updated_at ==========
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER tg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_peneiras_updated BEFORE UPDATE ON public.peneiras
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_candidatos_updated BEFORE UPDATE ON public.candidatos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_avaliacoes_updated BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ========== TRIGGER: auto-create profile + atleta role on signup ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, nome, email, nome_clube, cnpj)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'nome_clube',
    NEW.raw_user_meta_data->>'cnpj'
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'atleta');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RLS POLICIES ==========

-- profiles: user reads/updates own; admin reads all
CREATE POLICY "own profile read" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_roles: user reads own; admin reads/writes all
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- peneiras: public visible to authenticated; private only to admin/creator; admin manages
CREATE POLICY "peneiras read" ON public.peneiras FOR SELECT
  USING (
    visibilidade = 'publica'
    OR public.has_role(auth.uid(), 'admin')
    OR auth.uid() = created_by
  );
CREATE POLICY "admin manage peneiras" ON public.peneiras FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- candidatos: atleta reads own; admin reads all; clube reads aprovados
CREATE POLICY "candidato own read" ON public.candidatos FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'clube') AND status = 'aprovado')
  );
CREATE POLICY "atleta self insert" ON public.candidatos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin manage candidatos" ON public.candidatos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- avaliacoes: admin manages; atleta reads own
CREATE POLICY "avaliacoes read" ON public.avaliacoes FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.candidatos c
      WHERE c.id = avaliacoes.candidato_id AND c.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'clube')
  );
CREATE POLICY "admin manage avaliacoes" ON public.avaliacoes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- contatos_desbloqueados: clube reads/inserts own; admin sees all
CREATE POLICY "clube own contatos read" ON public.contatos_desbloqueados FOR SELECT
  USING (auth.uid() = clube_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "clube own contatos insert" ON public.contatos_desbloqueados FOR INSERT
  WITH CHECK (auth.uid() = clube_id AND public.has_role(auth.uid(), 'clube'));
