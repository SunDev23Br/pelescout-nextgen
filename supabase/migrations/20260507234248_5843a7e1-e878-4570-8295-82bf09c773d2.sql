
CREATE TYPE public.admin_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.admin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status public.admin_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own admin request read"
ON public.admin_requests FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own admin request insert"
ON public.admin_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin update admin requests"
ON public.admin_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_admin_requests_updated_at
BEFORE UPDATE ON public.admin_requests
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
