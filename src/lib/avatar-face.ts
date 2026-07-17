// Client-side helpers for the athlete face-photo requirement.
// - `cropToSquareBlob` centre-crops the uploaded image and resizes to 512×512.
// - `detectFaces` uses the browser FaceDetector when available; if not, returns
//   `unknown` so callers can fall back to accepting the photo.

export type FaceDetectResult = "ok" | "no-face" | "unknown";

interface FaceDetectorLike {
  detect: (image: ImageBitmap | HTMLImageElement) => Promise<Array<unknown>>;
}
type FaceDetectorCtor = new (opts?: { fastMode?: boolean }) => FaceDetectorLike;

async function loadImageBitmap(file: Blob): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") return createImageBitmap(file);
  // Fallback via HTMLImageElement -> canvas -> bitmap.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return await createImageBitmap(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function cropToSquareBlob(file: File, size = 512): Promise<Blob> {
  const bmp = await loadImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const sx = Math.floor((bmp.width - side) / 2);
  const sy = Math.floor((bmp.height - side) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível para recortar a imagem.");
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, size, size);
  bmp.close?.();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar recorte."))),
      "image/jpeg",
      0.9,
    );
  });
}

export async function detectFaces(file: File): Promise<FaceDetectResult> {
  const Ctor = (globalThis as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
  if (!Ctor) return "unknown";
  try {
    const bmp = await loadImageBitmap(file);
    const det = new Ctor({ fastMode: true });
    const faces = await det.detect(bmp);
    bmp.close?.();
    return faces && faces.length > 0 ? "ok" : "no-face";
  } catch {
    return "unknown";
  }
}
