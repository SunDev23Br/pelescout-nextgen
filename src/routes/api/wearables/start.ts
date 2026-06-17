import { createFileRoute } from "@tanstack/react-router";
import {
  buildGoogleFitAuthUrl,
  getRedirectUri,
  getUserIdFromBearer,
  signState,
} from "@/lib/wearables.server";

export const Route = createFileRoute("/api/wearables/start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const uid = await getUserIdFromBearer(request.headers.get("authorization"));
        if (!uid) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json().catch(() => ({}))) as {
          provider?: string;
          redirect?: string;
        };
        if (body.provider !== "google_fit") {
          return new Response("Provider não suportado", { status: 400 });
        }
        const origin = new URL(request.url).origin;
        const redirectUri = getRedirectUri(origin, "google_fit");
        const finalRedirect = body.redirect ?? "/perfil";
        const state = signState({ uid, provider: "google_fit", redirect: finalRedirect });
        const url = buildGoogleFitAuthUrl(state, redirectUri);
        return Response.json({ url });
      },
    },
  },
});
