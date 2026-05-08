-- Reuse admin_request_status enum for clube_requests
CREATE TABLE public.clube_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status admin_request_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clube_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own clube request insert"
ON public.clube_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own clube request read"
ON public.clube_requests FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin update clube requests"
ON public.clube_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER clube_requests_updated_at
BEFORE UPDATE ON public.clube_requests
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.approve_clube_request(_request_id uuid)
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

  SELECT user_id INTO _user_id FROM public.clube_requests WHERE id = _request_id;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'clube')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.clube_requests
  SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_clube_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem rejeitar solicitações';
  END IF;

  UPDATE public.clube_requests
  SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_clube_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_clube_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_clube_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_clube_request(uuid) TO authenticated;