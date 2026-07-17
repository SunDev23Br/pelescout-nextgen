import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// Curated public athlete profile for the shareable /a/:id page.
// Uses the publishable key so unauthenticated visitors can preview a link.

export interface PublicAtleta {
  id: string;
  nome: string;
  avatar_url: string | null;
  posicao: string | null;
  cidade: string | null;
  altura: number | null;
  peso: number | null;
  pe: string | null;
  data_nascimento: string | null;
  bio: string | null;
  skills: Record<string, number> | null;
  skills_validated: Record<string, number> | null;
  skills_validated_at: string | null;
  historico_clubes: unknown[] | null;
  stats: Record<string, unknown> | null;
}

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        // sb_ opaque keys must not be sent as Authorization bearer.
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getPublicAtleta = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.id)) throw new Error("ID inválido");
    return input;
  })
  .handler(async ({ data }): Promise<PublicAtleta | null> => {
    const supa = publicClient();
    const { data: rows, error } = await supa.rpc("get_public_atleta", { _id: data.id });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    return (row as PublicAtleta | undefined) ?? null;
  });
