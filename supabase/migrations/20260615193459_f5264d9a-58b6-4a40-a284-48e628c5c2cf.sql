
-- Extend avaliacoes to support full live evaluation payload and atleta-user evaluations
ALTER TABLE public.avaliacoes
  ALTER COLUMN candidato_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS atleta_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS peneira_id uuid REFERENCES public.peneiras(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS intensidade numeric,
  ADD COLUMN IF NOT EXISTS mental numeric,
  ADD COLUMN IF NOT EXISTS nota_geral numeric,
  ADD COLUMN IF NOT EXISTS decisao text,
  ADD COLUMN IF NOT EXISTS tags_positivas text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS tags_negativas text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS pe_bonus numeric DEFAULT 0;

-- Ensure at least one target
ALTER TABLE public.avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_target_check;
ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_target_check
  CHECK (candidato_id IS NOT NULL OR atleta_user_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_atleta_user_id ON public.avaliacoes(atleta_user_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_candidato_id ON public.avaliacoes(candidato_id);

-- Update SELECT policy to include atleta_user_id case
DROP POLICY IF EXISTS "avaliacoes read" ON public.avaliacoes;
CREATE POLICY "avaliacoes read" ON public.avaliacoes
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR atleta_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.candidatos c
    WHERE c.id = avaliacoes.candidato_id AND c.user_id = auth.uid()
  )
  OR (
    public.has_role(auth.uid(), 'clube'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.contatos_desbloqueados cd
      WHERE cd.clube_id = auth.uid() AND cd.candidato_id = avaliacoes.candidato_id
    )
  )
);
