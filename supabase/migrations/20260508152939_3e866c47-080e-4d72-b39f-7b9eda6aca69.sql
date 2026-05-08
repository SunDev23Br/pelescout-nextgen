
REVOKE EXECUTE ON FUNCTION public.approve_admin_request(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_admin_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_admin_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_admin_request(uuid) TO authenticated;
