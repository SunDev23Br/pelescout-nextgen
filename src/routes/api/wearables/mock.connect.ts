import { createFileRoute } from "@tanstack/react-router";
import { createMockConnection, getUserIdFromBearer, syncConnection } from "@/lib/wearables.server";

export const Route = createFileRoute("/api/wearables/mock/connect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const uid = await getUserIdFromBearer(request.headers.get("authorization"));
        if (!uid) return new Response("Unauthorized", { status: 401 });
        try {
          const id = await createMockConnection(uid);
          await syncConnection(id).catch((e) => console.error("[wearables] mock first sync", e));
          return Response.json({ ok: true, id });
        } catch (e: any) {
          return new Response(String(e?.message ?? e), { status: 500 });
        }
      },
    },
  },
});
