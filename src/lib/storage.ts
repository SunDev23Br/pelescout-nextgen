import { supabase } from "@/integrations/supabase/client";

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 60,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", bmp: "image/bmp", svg: "image/svg+xml",
  heic: "image/heic", heif: "image/heif", tif: "image/tiff", tiff: "image/tiff",
  ico: "image/x-icon",
  mp4: "video/mp4", m4v: "video/x-m4v", webm: "video/webm", ogv: "video/ogg",
  mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
  flv: "video/x-flv", wmv: "video/x-ms-wmv", "3gp": "video/3gpp", "3g2": "video/3gpp2",
  mpeg: "video/mpeg", mpg: "video/mpeg", ts: "video/mp2t",
};

export function guessMimeFromExt(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? "application/octet-stream";
}
