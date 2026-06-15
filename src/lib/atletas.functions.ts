import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AtletaItem = {
  id: string;
  userId: string;
  nome: string;
  avatar: string;
  posicao: string;
  cidade: string;
  dataNascimento: string;
  altura: number;
  peso: number;
  pe: string;
  email: string;
  celular: string;
  notaGeral?: number;
  status: "pendente" | "avaliado" | "aprovado";
};

async function assertScout(supabase: any, userId: string) {
  const [{ data: isAdmin }, { data: isClube }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "clube" }),
  ]);
  if (!isAdmin && !isClube) {
    throw new Error("Apenas olheiros e clubes podem acessar candidatos");
  }
}

function mapProfile(p: any): AtletaItem {
  return {
    id: p.id,
    userId: p.id,
    nome: p.nome ?? "Atleta",
    avatar: p.avatar_url ?? "",
    posicao: p.posicao ?? "",
    cidade: p.cidade ?? "",
    dataNascimento: p.data_nascimento ?? "",
    altura: p.altura ?? 0,
    peso: p.peso ?? 0,
    pe: p.pe ?? "",
    email: p.email ?? "",
    celular: p.celular ?? "",
    status: "pendente",
  };
}

export const listAtletas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AtletaItem[]> => {
    const { supabase, userId } = context;
    await assertScout(supabase, userId);

    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "atleta");
    if (rolesErr) throw new Error(rolesErr.message);
    const ids = (roles ?? []).map((r) => r.user_id as string);
    if (ids.length === 0) return [];

    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select(
        "id, nome, avatar_url, posicao, cidade, data_nascimento, altura, peso, pe, email, celular",
      )
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    return (profiles ?? []).map(mapProfile);
  });

export const getAtleta = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertScout(supabase, userId);

    const { data: p, error } = await supabase
      .from("profiles")
      .select(
        "id, nome, avatar_url, posicao, cidade, data_nascimento, altura, peso, pe, email, celular",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!p) return null;

    return {
      ...mapProfile(p),
      avaliacao: undefined as
        | { tecnica: number; fisico: number; tatico: number; psicologico: number }
        | undefined,
      comentario: undefined as string | undefined,
    };
  });
