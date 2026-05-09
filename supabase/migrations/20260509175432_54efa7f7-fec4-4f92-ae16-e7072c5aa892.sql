ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS celular text,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS posicao public.posicao,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS altura integer,
  ADD COLUMN IF NOT EXISTS peso integer,
  ADD COLUMN IF NOT EXISTS pe public.pe_dominante;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, nome, email, nome_clube, cnpj,
    celular, data_nascimento, posicao, cidade, altura, peso, pe
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'nome_clube',
    NEW.raw_user_meta_data->>'cnpj',
    NEW.raw_user_meta_data->>'celular',
    NULLIF(NEW.raw_user_meta_data->>'data_nascimento','')::date,
    NULLIF(NEW.raw_user_meta_data->>'posicao','')::public.posicao,
    NEW.raw_user_meta_data->>'cidade',
    NULLIF(NEW.raw_user_meta_data->>'altura','')::integer,
    NULLIF(NEW.raw_user_meta_data->>'peso','')::integer,
    NULLIF(NEW.raw_user_meta_data->>'pe','')::public.pe_dominante
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'atleta');

  RETURN NEW;
END $function$;

CREATE UNIQUE INDEX IF NOT EXISTS candidatos_user_peneira_unique
  ON public.candidatos (user_id, peneira_id)
  WHERE user_id IS NOT NULL;