import { useEffect, useState } from "react";
import { FileIcon, ImageIcon, FilmIcon, ExternalLink } from "lucide-react";
import { getSignedMediaUrl } from "@/lib/chat";

const BROWSER_IMAGE_MIMES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif",
  "image/bmp", "image/svg+xml", "image/x-icon",
]);
const BROWSER_VIDEO_MIMES = new Set([
  "video/mp4", "video/webm", "video/ogg", "video/x-m4v",
]);

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

  const fileName = path.split("/").pop() ?? "arquivo";
  const mimeLower = (mime ?? "").toLowerCase();
  const previewable =
    (kind === "image" && BROWSER_IMAGE_MIMES.has(mimeLower)) ||
    (kind === "video" && BROWSER_VIDEO_MIMES.has(mimeLower));

  if (kind === "image" && previewable) {
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
  if (kind === "video" && previewable) {
    return (
      <video
        src={url}
        controls
        className="max-h-72 max-w-xs rounded-lg"
        preload="metadata"
      />
    );
  }

  // Fallback card for unsupported (HEIC, MKV, MOV, AVI, etc.) and generic files
  const Icon = kind === "image" ? ImageIcon : kind === "video" ? FilmIcon : FileIcon;
  const label =
    kind === "image" ? "Imagem" : kind === "video" ? "Vídeo" : "Arquivo";

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download={fileName}
      className="flex max-w-xs items-center gap-3 rounded-lg border border-border bg-bg3 px-3 py-2.5 text-sm transition hover:bg-bg2"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{fileName}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          {label}{mime ? ` · ${mime}` : ""}
        </div>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}
