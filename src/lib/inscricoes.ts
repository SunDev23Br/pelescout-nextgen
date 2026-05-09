import { supabase } from "@/integrations/supabase/client";

export type MinhaInscricao = {
  id: string;
  status: string;
};

export async function getMinhaInscricao(
  peneiraId: string,
): Promise<MinhaInscricao | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from("candidatos")
    .select("id, status")
    .eq("user_id", userId)
    .eq("peneira_id", peneiraId)
    .maybeSingle();
  if (error) return null;
  return data as MinhaInscricao | null;
}

export async function inscreverNaPeneira(peneiraId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Você precisa estar logado.");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select(
      "nome, email, celular, data_nascimento, posicao, cidade, altura, peso, pe",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileErr || !profile) {
    throw new Error("Não foi possível carregar seu perfil.");
  }

  const faltando: string[] = [];
  if (!profile.celular) faltando.push("celular");
  if (!profile.data_nascimento) faltando.push("data de nascimento");
  if (!profile.posicao) faltando.push("posição");
  if (!profile.altura) faltando.push("altura");
  if (!profile.peso) faltando.push("peso");
  if (!profile.pe) faltando.push("pé preferencial");
  if (faltando.length) {
    throw new Error(
      `Complete seu perfil de atleta antes de se inscrever (faltando: ${faltando.join(", ")}).`,
    );
  }

  const { data, error } = await supabase
    .from("candidatos")
    .insert({
      user_id: userId,
      peneira_id: peneiraId,
      nome: profile.nome,
      email: profile.email,
      celular: profile.celular!,
      data_nascimento: profile.data_nascimento!,
      posicao: profile.posicao!,
      cidade: profile.cidade ?? "—",
      altura: profile.altura!,
      peso: profile.peso!,
      pe: profile.pe!,
      status: "pendente",
    })
    .select("id, status")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Você já está inscrito nesta peneira.");
    }
    throw new Error(error.message);
  }
  return data as MinhaInscricao;
}
