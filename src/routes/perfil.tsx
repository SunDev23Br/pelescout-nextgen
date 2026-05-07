import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Pelé Next Gen" },
      { name: "description", content: "Edite suas informações de perfil." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user, ready, navigate]);

  if (!ready || !user) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  async function handleAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast.error("Falha ao enviar imagem: " + upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);
    setUploading(false);
    if (updErr) {
      toast.error("Falha ao salvar foto: " + updErr.message);
      return;
    }
    setAvatarUrl(url);
    window.dispatchEvent(new Event("png-session"));
    toast.success("Foto atualizada!");
  }

  async function removerFoto() {
    if (!user) return;
    setUploading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAvatarUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    window.dispatchEvent(new Event("png-session"));
    toast.success("Foto removida.");
  }

  async function salvarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (nome.trim().length < 3) {
      toast.error("Informe seu nome completo.");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nome: nome.trim() })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    window.dispatchEvent(new Event("png-session"));
    toast.success("Perfil atualizado!");
  }

  async function salvarAuth(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const updates: { email?: string; password?: string } = {};
    if (email && email !== user.email) updates.email = email.trim();
    if (senha) {
      if (senha.length < 6) {
        toast.error("A senha deve ter ao menos 6 caracteres.");
        return;
      }
      updates.password = senha;
    }
    if (!updates.email && !updates.password) {
      toast.message("Nada para atualizar.");
      return;
    }
    setSavingAuth(true);
    const { error } = await supabase.auth.updateUser(updates);
    if (!error && updates.email) {
      await supabase.from("profiles").update({ email: updates.email }).eq("id", user.id);
    }
    setSavingAuth(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSenha("");
    if (updates.email) {
      toast.success("Verifique o novo e-mail para confirmar a alteração.");
    } else {
      toast.success("Senha atualizada!");
    }
    window.dispatchEvent(new Event("png-session"));
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Minha conta
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Meu perfil</h1>
          <p className="mt-2 text-muted-foreground">
            Atualize suas informações pessoais, foto, e-mail e senha.
          </p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h2 className="mb-4 font-display text-lg font-bold">Foto de perfil</h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <AthleteAvatar
              src={avatarUrl ?? undefined}
              alt={user.nome}
              className="h-24 w-24 border-2 border-primary/40 shadow-card"
            />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP até 5MB.</p>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  {avatarUrl ? "Trocar foto" : "Enviar foto"}
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploading}
                    onClick={removerFoto}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remover
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatar}
              />
            </div>
          </div>
        </section>

        <form
          onSubmit={salvarPerfil}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-lg font-bold">Dados pessoais</h2>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nome completo</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Salvar alterações
            </Button>
          </div>
        </form>

        <form
          onSubmit={salvarAuth}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-lg font-bold">E-mail e senha</h2>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Ao alterar, será necessário confirmar pelo novo e-mail.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nova senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={savingAuth}>
              {savingAuth ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Atualizar acesso
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
