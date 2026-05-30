import { supabase } from "@/integrations/supabase/client";
import { guessMimeFromExt } from "@/lib/storage";

export interface AthleteVideo {
  id: string;
  atleta_id: string;
  path: string;
  mime: string | null;
  size: number | null;
  titulo: string | null;
  created_at: string;
}

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export async function listAthleteVideos(atletaId: string): Promise<AthleteVideo[]> {
  const { data, error } = await supabase
    .from("athlete_videos")
    .select("*")
    .eq("atleta_id", atletaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AthleteVideo[];
}

export async function uploadAthleteVideo(file: File, titulo?: string): Promise<AthleteVideo> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Faça login.");
  if (file.size > MAX_BYTES) throw new Error("Vídeo maior que 100 MB.");

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const mime = file.type && file.type.length > 0 ? file.type : guessMimeFromExt(ext);
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("athlete-videos")
    .upload(path, file, { contentType: mime, upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { data, error } = await supabase
    .from("athlete_videos")
    .insert({
      atleta_id: uid,
      path,
      mime,
      size: file.size,
      titulo: titulo?.trim() || file.name,
    })
    .select("*")
    .single();
  if (error) {
    // best-effort cleanup
    await supabase.storage.from("athlete-videos").remove([path]);
    throw new Error(error.message);
  }
  return data as AthleteVideo;
}

export async function deleteAthleteVideo(video: AthleteVideo): Promise<void> {
  const { error } = await supabase.from("athlete_videos").delete().eq("id", video.id);
  if (error) throw new Error(error.message);
  await supabase.storage.from("athlete-videos").remove([video.path]);
}
