import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, getUserIdFromBearer } from "@/lib/wearables.server";

const BodySchema = z.object({
  candidatoId: z.string().uuid(),
});

/**
 * Desbloqueio de contato de atleta.
 * A criação da linha em `contatos_desbloqueados` é feita apenas aqui, no servidor,
 * após validar autenticação, papel de clube e a confirmação do pagamento.
 * O cliente não tem mais permissão de INSERT direto nessa tabela.
 */
export const Route = createFileRoute("/api/contatos/unlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const uid = await getUserIdFromBearer(request.headers.get("authorization"));
        if (!uid) return new Response("Unauthorized", { status: 401 });

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response("Requisição inválida", { status: 400 });
        }

        const admin = getAdmin();

        // Só clubes podem desbloquear contatos.
        const { data: roles, error: rolesErr } = await admin
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        if (rolesErr) return new Response("Erro ao validar permissões", { status: 500 });
        if (!(roles ?? []).some((r) => r.role === "clube")) {
          return new Response("Apenas clubes podem desbloquear contatos", { status: 403 });
        }

        // O alvo precisa existir.
        const { data: cand } = await admin
          .from("candidatos")
          .select("id")
          .eq("id", parsed.candidatoId)
          .maybeSingle();
        if (!cand) return new Response("Candidato não encontrado", { status: 404 });

        // Confirmação de pagamento (a ser ligada ao provedor de pagamentos).
        const paymentConfirmed = await confirmPayment(uid, parsed.candidatoId);
        if (!paymentConfirmed) {
          return new Response("Pagamento não confirmado", { status: 402 });
        }

        const { error } = await admin
          .from("contatos_desbloqueados")
          .insert({ clube_id: uid, candidato_id: parsed.candidatoId });
        // 23505 = já desbloqueado, tratamos como sucesso idempotente.
        if (error && error.code !== "23505") {
          console.error("[contatos/unlock] insert failed", error.code);
          return new Response("Não foi possível desbloquear o contato", { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});

/**
 * Ponto único de verificação de pagamento — executado somente no servidor.
 * TODO: ligar ao provedor de pagamentos (validar a cobrança do clube para este
 * candidato antes de liberar). Hoje o checkout ainda é simulado no produto.
 */
async function confirmPayment(_clubeId: string, _candidatoId: string): Promise<boolean> {
  return true;
}
