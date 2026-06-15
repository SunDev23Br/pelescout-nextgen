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
    const ids = (roles ?? []).map((r: any) => r.user_id as string);
    if (ids.length === 0) return [];

    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select(
        "id, nome, avatar_url, posicao, cidade, data_nascimento, altura, peso, pe, email, celular",
      )
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    const { data: avals } = await supabase
      .from("avaliacoes")
      .select("candidato_user_id, tecnica, fisico, tatico, psicologico, created_at")
      .in("candidato_user_id", ids)
      .order("created_at", { ascending: false });

    const latestByUser = new Map<string, any>();
    for (const a of avals ?? []) {
      if (!latestByUser.has(a.candidato_user_id)) latestByUser.set(a.candidato_user_id, a);
    }

    return (profiles ?? []).map((p: any) => {
      const a = latestByUser.get(p.id);
      let notaGeral: number | undefined;
      let status: AtletaItem["status"] = "pendente";
      if (a) {
        notaGeral =
          Math.round(((a.tecnica + a.fisico + a.tatico + a.psicologico) / 4) * 10) / 10;
        status = notaGeral >= 3 ? "aprovado" : "avaliado";
      }
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
        notaGeral,
        status,
      };
    });
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

    const { data: aval } = await supabase
      .from("avaliacoes")
      .select("tecnica, fisico, tatico, psicologico, comentario, created_at")
      .eq("candidato_user_id", data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let notaGeral: number | undefined;
    if (aval) {
      notaGeral =
        Math.round(
          ((aval.tecnica + aval.fisico + aval.tatico + aval.psicologico) / 4) * 10,
        ) / 10;
    }

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
      notaGeral,
      avaliacao: aval
        ? {
            tecnica: aval.tecnica,
            fisico: aval.fisico,
            tatico: aval.tatico,
            psicologico: aval.psicologico,
          }
        : undefined,
      comentario: aval?.comentario ?? undefined,
    };
  });
