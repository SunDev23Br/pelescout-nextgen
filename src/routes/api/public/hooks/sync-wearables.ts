import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, syncConnection } from "@/lib/wearables.server";

// Called daily by pg_cron. Auth via Supabase anon `apikey` header.
export const Route = createFileRoute("/api/public/hooks/sync-wearables")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        if (!apiKey || apiKey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        const admin = getAdmin();
        const { data: conns, error } = await admin
          .from("wearable_connections")
          .select("id");
        if (error) return new Response(error.message, { status: 500 });

        let ok = 0;
        let fail = 0;
        for (const c of conns ?? []) {
          try {
            await syncConnection(c.id);
            ok++;
          } catch (e) {
            fail++;
            console.error("[cron sync-wearables]", c.id, e);
          }
        }
        return Response.json({ ok, fail, total: (conns ?? []).length });
      },
    },
  },
});
