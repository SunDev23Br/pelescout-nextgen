ALTER TABLE public.candidatos ADD COLUMN data_nascimento date;
UPDATE public.candidatos SET data_nascimento = (current_date - (idade || ' years')::interval)::date WHERE data_nascimento IS NULL AND idade IS NOT NULL;
ALTER TABLE public.candidatos ALTER COLUMN data_nascimento SET NOT NULL;
ALTER TABLE public.candidatos DROP COLUMN idade;