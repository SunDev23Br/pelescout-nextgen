import { createFileRoute } from "@tanstack/react-router";
import {
  exchangeGoogleFitCode,
  getRedirectUri,
  saveConnection,
  syncConnection,
  verifyState,
} from "@/lib/wearables.server";

export const Route = createFileRoute("/api/wearables/callback/$provider")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const err = url.searchParams.get("error");
        const origin = url.origin;

        function bounce(qs: string) {
          return new Response(null, {
            status: 302,
            headers: { Location: `/perfil?${qs}` },
          });
        }

        if (err) return bounce(`wearable_error=${encodeURIComponent(err)}`);
        if (!code || !state) return bounce("wearable_error=missing_params");

        const parsed = verifyState(state);
        if (!parsed) return bounce("wearable_error=invalid_state");
        if (parsed.provider !== params.provider || params.provider !== "google_fit") {
          return bounce("wearable_error=provider_mismatch");
        }

        try {
          const redirectUri = getRedirectUri(origin, "google_fit");
          const tokens = await exchangeGoogleFitCode(code, redirectUri);
          const connId = await saveConnection({
            userId: parsed.uid,
            provider: "google_fit",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? null,
            expiresIn: tokens.expires_in,
            scopes: tokens.scope,
          });
          // Best-effort first sync; ignore failure (user can retry).
          syncConnection(connId).catch((e) => console.error("[wearables] first sync failed", e));
          return bounce("wearable=connected");
        } catch (e: any) {
          console.error("[wearables] callback error", e);
          return bounce(`wearable_error=${encodeURIComponent(String(e?.message ?? e).slice(0, 200))}`);
        }
      },
    },
  },
});
