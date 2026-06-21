import { useCallback, useEffect, useRef, useState } from "react";
import { createParser } from "eventsource-parser";
import { toast } from "sonner";

interface UseTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

/**
 * Hook para Text-to-Speech via /api/tts (Lovable AI streaming SSE).
 * Decodifica PCM 24kHz e toca em tempo real via AudioContext.
 */
export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const cleanup = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    sourcesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const speak = useCallback(async (text: string) => {
    cleanup();
    setIsLoading(true);

    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtor({ sampleRate: 24000 });
    ctxRef.current = ctx;
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }

    const abort = new AbortController();
    abortRef.current = abort;

    let playhead = 0;
    let pending = new Uint8Array(0);
    let lastSourceEndedAt = 0;

    const playChunk = (incoming: Uint8Array) => {
      if (!ctxRef.current) return;
      const merged = new Uint8Array(pending.length + incoming.length);
      merged.set(pending);
      merged.set(incoming, pending.length);
      const usable = merged.length - (merged.length % 2);
      pending = merged.slice(usable);
      if (usable === 0) return;
      const samples = new Int16Array(merged.buffer, 0, usable / 2);
      const floats = Float32Array.from(samples, (s) => s / 32768);
      const buffer = ctxRef.current.createBuffer(1, floats.length, 24000);
      buffer.copyToChannel(floats, 0);
      const source = ctxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(ctxRef.current.destination);
      if (playhead === 0) {
        playhead = ctxRef.current.currentTime + 0.05;
      } else {
        playhead = Math.max(playhead, ctxRef.current.currentTime);
      }
      source.start(playhead);
      playhead += buffer.duration;
      lastSourceEndedAt = playhead;
      sourcesRef.current.push(source);
      source.onended = () => {
        sourcesRef.current = sourcesRef.current.filter((s) => s !== source);
        if (
          sourcesRef.current.length === 0 &&
          ctxRef.current &&
          ctxRef.current.currentTime >= lastSourceEndedAt - 0.01
        ) {
          setIsSpeaking(false);
        }
      };
    };

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "");
        if (res.status === 402) toast.error("Créditos de IA esgotados.");
        else if (res.status === 429) toast.error("Muitas requisições. Aguarde um momento.");
        else toast.error(msg || "Falha ao gerar áudio.");
        cleanup();
        return;
      }

      setIsLoading(false);
      setIsSpeaking(true);

      const parser = createParser({
        onEvent(event) {
          let payload: { type: string; audio?: string };
          try {
            payload = JSON.parse(event.data);
          } catch {
            return;
          }
          if (payload.type !== "speech.audio.delta" || !payload.audio) return;
          const binary = atob(payload.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          playChunk(bytes);
        },
      });

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        parser.feed(value);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("TTS error", err);
      toast.error("Erro ao reproduzir áudio.");
      cleanup();
    }
  }, [cleanup]);

  return { speak, stop, isSpeaking, isLoading };
}
