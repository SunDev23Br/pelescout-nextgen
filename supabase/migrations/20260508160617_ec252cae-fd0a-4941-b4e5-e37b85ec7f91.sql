CREATE OR REPLACE FUNCTION public.reject_admin_request(_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'suporte') THEN
    RAISE EXCEPTION 'Apenas o suporte pode rejeitar solicitações';
  END IF;
  DELETE FROM public.admin_requests WHERE id = _request_id;
END; $$;

CREATE OR REPLACE FUNCTION public.reject_clube_request(_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'suporte') THEN
    RAISE EXCEPTION 'Apenas o suporte pode rejeitar solicitações';
  END IF;
  DELETE FROM public.clube_requests WHERE id = _request_id;
END; $$;