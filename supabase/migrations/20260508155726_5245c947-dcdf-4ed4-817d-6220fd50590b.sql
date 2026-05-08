-- Update approval/rejection functions to require 'suporte' role
CREATE OR REPLACE FUNCTION public.approve_admin_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'suporte') THEN
    RAISE EXCEPTION 'Apenas o suporte pode aprovar solicitações';
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
  IF NOT public.has_role(auth.uid(), 'suporte') THEN
    RAISE EXCEPTION 'Apenas o suporte pode rejeitar solicitações';
  END IF;

  UPDATE public.admin_requests
  SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_clube_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'suporte') THEN
    RAISE EXCEPTION 'Apenas o suporte pode aprovar solicitações';
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
  IF NOT public.has_role(auth.uid(), 'suporte') THEN
    RAISE EXCEPTION 'Apenas o suporte pode rejeitar solicitações';
  END IF;

  UPDATE public.clube_requests
  SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$$;

-- Update RLS: only suporte can update/read all requests
DROP POLICY IF EXISTS "admin update admin requests" ON public.admin_requests;
DROP POLICY IF EXISTS "own admin request read" ON public.admin_requests;
CREATE POLICY "suporte update admin requests"
ON public.admin_requests FOR UPDATE
USING (has_role(auth.uid(), 'suporte'::app_role))
WITH CHECK (has_role(auth.uid(), 'suporte'::app_role));
CREATE POLICY "own admin request read"
ON public.admin_requests FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'suporte'::app_role));

DROP POLICY IF EXISTS "admin update clube requests" ON public.clube_requests;
DROP POLICY IF EXISTS "own clube request read" ON public.clube_requests;
CREATE POLICY "suporte update clube requests"
ON public.clube_requests FOR UPDATE
USING (has_role(auth.uid(), 'suporte'::app_role))
WITH CHECK (has_role(auth.uid(), 'suporte'::app_role));
CREATE POLICY "own clube request read"
ON public.clube_requests FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'suporte'::app_role));

-- Suporte also needs to be able to read profiles + roles to manage panel
CREATE POLICY "suporte read all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'suporte'::app_role));

CREATE POLICY "suporte read all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'suporte'::app_role));