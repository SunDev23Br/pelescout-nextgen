import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
  voice: z.string().optional(),
});

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response("LOVABLE_API_KEY not configured", { status: 500 });
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch (err) {
          return new Response("Invalid request body", { status: 400 });
        }

        try {
          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/audio/speech",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openai/gpt-4o-mini-tts",
                input: parsed.text,
                voice: parsed.voice ?? "alloy",
                stream_format: "sse",
                response_format: "pcm",
              }),
              signal: request.signal,
            },
          );

          if (!upstream.ok) {
            const detail = await upstream.text().catch(() => "");
            if (upstream.status === 402) {
              return new Response("Créditos esgotados. Adicione créditos ao workspace.", { status: 402 });
            }
            if (upstream.status === 429) {
              return new Response("Muitas requisições. Tente novamente em instantes.", { status: 429 });
            }
            return new Response(detail || "TTS upstream error", { status: upstream.status });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (err) {
          if (request.signal.aborted) {
            return new Response(null, { status: 499 });
          }
          throw err;
        }
      },
    },
  },
});
