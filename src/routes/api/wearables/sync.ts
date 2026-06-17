import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, getUserIdFromBearer, syncConnection } from "@/lib/wearables.server";

export const Route = createFileRoute("/api/wearables/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const uid = await getUserIdFromBearer(request.headers.get("authorization"));
        if (!uid) return new Response("Unauthorized", { status: 401 });

        const admin = getAdmin();
        const { data: conns, error } = await admin
          .from("wearable_connections")
          .select("id")
          .eq("user_id", uid);
        if (error) return new Response(error.message, { status: 500 });
        if (!conns?.length) return Response.json({ ok: true, synced: 0 });

        const results: Array<{ id: string; ok: boolean; error?: string }> = [];
        for (const c of conns) {
          try {
            await syncConnection(c.id);
            results.push({ id: c.id, ok: true });
          } catch (e: any) {
            results.push({ id: c.id, ok: false, error: String(e?.message ?? e) });
          }
        }
        return Response.json({ ok: true, synced: results.filter((r) => r.ok).length, results });
      },
    },
  },
});
