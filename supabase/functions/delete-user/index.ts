import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Missing auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Verify caller is suporte
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser(token);
    const callerId = userData.user?.id;
    if (!callerId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: rolesData } = await admin.from("user_roles").select("role").eq("user_id", callerId);
    const isSuporte = (rolesData ?? []).some((r) => r.role === "suporte");
    if (!isSuporte) return new Response(JSON.stringify({ error: "Apenas suporte pode excluir usuários" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { user_id } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "user_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (user_id === callerId) return new Response(JSON.stringify({ error: "Você não pode excluir a si mesmo" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Clean dependent rows
    await admin.from("user_roles").delete().eq("user_id", user_id);
    await admin.from("admin_requests").delete().eq("user_id", user_id);
    await admin.from("clube_requests").delete().eq("user_id", user_id);
    await admin.from("profiles").delete().eq("id", user_id);

    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr) return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
