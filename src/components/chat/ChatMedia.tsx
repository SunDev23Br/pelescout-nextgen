import { useEffect, useState } from "react";
import { FileIcon, ImageIcon, FilmIcon, Download, Maximize2 } from "lucide-react";
import { getSignedUrl } from "@/lib/storage";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const BROWSER_IMAGE_MIMES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif",
  "image/bmp", "image/svg+xml", "image/x-icon",
]);
const BROWSER_VIDEO_MIMES = new Set([
  "video/mp4", "video/webm", "video/ogg", "video/x-m4v", "video/quicktime",
]);

export function ChatMedia({
  path,
  mime,
  kind,
  bucket = "chat-media",
}: {
  path: string;
  mime: string | null;
  kind: "image" | "video" | "file";
  bucket?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSignedUrl(bucket, path).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [bucket, path]);

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
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block overflow-hidden rounded-lg transition hover:opacity-90"
          aria-label="Ampliar imagem"
        >
          <img
            src={url}
            alt="Imagem enviada"
            className="max-h-72 max-w-xs rounded-lg object-cover"
          />
        </button>
        <MediaLightbox open={open} onOpenChange={setOpen} url={url} fileName={fileName} kind="image" />
      </>
    );
  }

  if (kind === "video" && previewable) {
    return (
      <>
        <div className="group relative max-w-xs overflow-hidden rounded-lg bg-black">
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            className="max-h-72 w-full"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-90 transition hover:bg-black/80"
            aria-label="Expandir vídeo"
            title="Expandir vídeo"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <MediaLightbox open={open} onOpenChange={setOpen} url={url} fileName={fileName} kind="video" mime={mime} />
      </>
    );
  }

  // Fallback card: also opens inline lightbox
  const Icon = kind === "image" ? ImageIcon : kind === "video" ? FilmIcon : FileIcon;
  const label =
    kind === "image" ? "Imagem" : kind === "video" ? "Vídeo" : "Arquivo";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-bg3 px-3 py-2.5 text-left text-sm transition hover:bg-bg2"
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
      </button>
      <MediaLightbox open={open} onOpenChange={setOpen} url={url} fileName={fileName} kind={kind} mime={mime} />
    </>
  );
}

export function MediaLightbox({
  open,
  onOpenChange,
  url,
  fileName,
  kind,
  mime,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string;
  fileName: string;
  kind: "image" | "video" | "file";
  mime?: string | null;
}) {
  const mimeLower = (mime ?? "").toLowerCase();
  const canPreviewVideo = kind === "video" && (mimeLower === "" || BROWSER_VIDEO_MIMES.has(mimeLower));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] border-border bg-bg1/95 p-0 sm:max-w-4xl">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5 pr-12">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{fileName}</div>
            {mime && <div className="truncate text-[11px] text-muted-foreground">{mime}</div>}
          </div>
          <a
            href={url}
            download={fileName}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-bg2"
            aria-label="Baixar"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
        <div className="flex max-h-[80vh] items-center justify-center bg-black/40 p-2">
          {kind === "image" ? (
            <img src={url} alt={fileName} className="max-h-[78vh] max-w-full object-contain" />
          ) : kind === "video" ? (
            canPreviewVideo ? (
              <video src={url} controls autoPlay playsInline className="max-h-[78vh] max-w-full" />
            ) : (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Este formato de vídeo não é suportado pelo navegador. Use o botão de download.
              </div>
            )
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Pré-visualização não disponível para este formato.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
