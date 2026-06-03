import { useEffect, useState } from "react";
import { Loader2, Trash2, Upload, FilmIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  listAthleteVideos,
  uploadAthleteVideo,
  deleteAthleteVideo,
  type AthleteVideo,
} from "@/lib/athlete-videos";
import { ChatMedia } from "@/components/chat/ChatMedia";

export function AthleteVideoGallery({
  atletaId,
  canManage,
  showCaptions = false,
}: {
  atletaId: string;
  canManage: boolean;
  showCaptions?: boolean;
}) {
  const [videos, setVideos] = useState<AthleteVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAthleteVideos(atletaId)
      .then((v) => {
        if (!cancelled) setVideos(v);
      })
      .catch((e) => toast.error(e.message ?? "Erro ao carregar vídeos"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [atletaId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const v = await uploadAthleteVideo(file);
      setVideos((prev) => [v, ...prev]);
      toast.success("Vídeo enviado!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar vídeo";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(v: AthleteVideo) {
    if (!confirm("Remover este vídeo?")) return;
    try {
      await deleteAthleteVideo(v);
      setVideos((prev) => prev.filter((x) => x.id !== v.id));
      toast.success("Vídeo removido.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao remover";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <FilmIcon className="h-5 w-5" /> Vídeos
        </h2>
        {canManage && (
          <label className="inline-flex">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
            <Button type="button" asChild size="sm" disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Enviar vídeo
              </span>
            </Button>
          </label>
        )}
      </div>

      {canManage && (
        <p className="text-xs text-muted-foreground">
          Qualquer formato de vídeo até 100 MB. Os vídeos abrem direto na plataforma.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum vídeo {canManage ? "enviado" : "publicado"} ainda.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((v) => (
            <div key={v.id} className="space-y-2 rounded-2xl border border-border bg-card p-3">
              <ChatMedia bucket="athlete-videos" path={v.path} mime={v.mime} kind="video" />
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 truncate text-sm font-medium">
                  {v.titulo ?? "Vídeo"}
                </div>
                {canManage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(v)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
