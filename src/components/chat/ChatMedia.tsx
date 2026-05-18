import { useEffect, useState } from "react";
import { getSignedMediaUrl } from "@/lib/chat";

export function ChatMedia({
  path,
  mime,
  kind,
}: {
  path: string;
  mime: string | null;
  kind: "image" | "video" | "file";
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSignedMediaUrl(path).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!url) {
    return (
      <div className="h-32 w-48 animate-pulse rounded-lg bg-bg3" aria-hidden="true" />
    );
  }
  if (kind === "image") {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt="Imagem enviada"
          className="max-h-72 max-w-xs rounded-lg object-cover"
        />
      </a>
    );
  }
  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        className="max-h-72 max-w-xs rounded-lg"
        preload="metadata"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg3 px-3 py-2 text-sm hover:bg-bg2"
    >
      📎 <span className="truncate">{path.split("/").pop()}</span>
      <span className="text-xs text-muted-foreground">{mime ?? ""}</span>
    </a>
  );
}
