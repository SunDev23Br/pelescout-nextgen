
-- Função atômica de aprovação (SECURITY DEFINER para contornar RLS no insert do papel)
CREATE OR REPLACE FUNCTION public.approve_admin_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem aprovar solicitações';
  END IF;

  SELECT user_id INTO _user_id FROM public.admin_requests WHERE id = _request_id;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.admin_requests
  SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_admin_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem rejeitar solicitações';
  END IF;

  UPDATE public.admin_requests
  SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$$;

-- Backfill: concede papel admin aos usuários já aprovados que ficaram sem o papel
INSERT INTO public.user_roles (user_id, role)
SELECT ar.user_id, 'admin'::app_role
FROM public.admin_requests ar
WHERE ar.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = ar.user_id AND ur.role = 'admin'
  )
ON CONFLICT (user_id, role) DO NOTHING;
