
REVOKE EXECUTE ON FUNCTION public.tg_profiles_validate_skills() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tg_profiles_skill_history() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_validate_athlete(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_validated_skills(uuid, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.accept_skill_validator_invite(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.can_validate_athlete(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_validated_skills(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_skill_validator_invite(uuid) TO authenticated;
