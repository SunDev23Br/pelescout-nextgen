CREATE OR REPLACE FUNCTION public.tg_candidatos_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.peneiras SET inscritos = inscritos + 1 WHERE id = NEW.peneira_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.peneiras SET inscritos = GREATEST(inscritos - 1, 0) WHERE id = OLD.peneira_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.peneira_id IS DISTINCT FROM OLD.peneira_id THEN
      UPDATE public.peneiras SET inscritos = GREATEST(inscritos - 1, 0) WHERE id = OLD.peneira_id;
      UPDATE public.peneiras SET inscritos = inscritos + 1 WHERE id = NEW.peneira_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS candidatos_count_trg ON public.candidatos;
CREATE TRIGGER candidatos_count_trg
AFTER INSERT OR DELETE OR UPDATE OF peneira_id ON public.candidatos
FOR EACH ROW EXECUTE FUNCTION public.tg_candidatos_count();

UPDATE public.peneiras p
SET inscritos = COALESCE((SELECT COUNT(*) FROM public.candidatos c WHERE c.peneira_id = p.id), 0);