import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Camera,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Plus,
  Trash2,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteVideoGallery } from "@/components/AthleteVideoGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

interface ClubeHist {
  clube: string;
  periodo?: string;
  descricao?: string;
}
interface AthleteStats {
  jogos?: number | null;
  gols?: number | null;
  assistencias?: number | null;
  titulos?: number | null;
}


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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Password change flow
  const [currentPassword, setCurrentPassword] = useState("");
  const [verifyingCurrent, setVerifyingCurrent] = useState(false);
  const [currentVerified, setCurrentVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Athlete extended profile
  const [bio, setBio] = useState("");
  const [stats, setStats] = useState<AthleteStats>({});
  const [historico, setHistorico] = useState<ClubeHist[]>([]);
  const [savingAtleta, setSavingAtleta] = useState(false);
  const [loadingAtleta, setLoadingAtleta] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user, ready, navigate]);

  useEffect(() => {
    if (!user || user.role !== "atleta") return;
    setLoadingAtleta(true);
    supabase
      .from("profiles")
      .select("bio, historico_clubes, stats")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBio(data.bio ?? "");
          setHistorico(((data.historico_clubes as ClubeHist[] | null) ?? []));
          setStats(((data.stats as AthleteStats | null) ?? {}));
        }
        setLoadingAtleta(false);
      });
  }, [user]);


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

  async function verificarSenhaAtual() {
    if (!user) return;
    if (!currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }
    setVerifyingCurrent(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    setVerifyingCurrent(false);
    if (error) {
      toast.error("Senha atual incorreta.");
      setCurrentVerified(false);
      return;
    }
    setCurrentVerified(true);
    toast.success("Senha verificada. Agora defina sua nova senha.");
  }

  async function enviarCodigoEmail() {
    if (!user) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/`,
    });
    setSendingReset(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Enviamos um link de redefinição para ${user.email}.`);
  }

  async function salvarNovaSenha(e: FormEvent) {
    e.preventDefault();
    if (!currentVerified) {
      toast.error("Confirme sua senha atual antes de continuar.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("A nova senha deve ser diferente da atual.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentVerified(false);
    toast.success("Senha atualizada com sucesso!");
  }

  async function salvarEmail(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!email || email === user.email) {
      toast.message("Nada para atualizar.");
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    if (!error) {
      await supabase.from("profiles").update({ email: email.trim() }).eq("id", user.id);
    }
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verifique o novo e-mail para confirmar a alteração.");
    window.dispatchEvent(new Event("png-session"));
  }

  async function salvarAtleta(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingAtleta(true);
    const cleanedHist = historico
      .map((h) => ({
        clube: (h.clube ?? "").trim(),
        periodo: (h.periodo ?? "").trim() || undefined,
        descricao: (h.descricao ?? "").trim() || undefined,
      }))
      .filter((h) => h.clube.length > 0);
    const cleanedStats: AthleteStats = {
      jogos: stats.jogos != null && !Number.isNaN(stats.jogos) ? Number(stats.jogos) : null,
      gols: stats.gols != null && !Number.isNaN(stats.gols) ? Number(stats.gols) : null,
      assistencias:
        stats.assistencias != null && !Number.isNaN(stats.assistencias)
          ? Number(stats.assistencias)
          : null,
      titulos:
        stats.titulos != null && !Number.isNaN(stats.titulos) ? Number(stats.titulos) : null,
    };
    const { error } = await supabase
      .from("profiles")
      .update({
        bio: bio.trim() || null,
        historico_clubes: cleanedHist as unknown as never,
        stats: cleanedStats as unknown as never,
      })

      .eq("id", user.id);
    setSavingAtleta(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHistorico(cleanedHist);
    setStats(cleanedStats);
    toast.success("Perfil de atleta atualizado!");
  }

  function setStatField(k: keyof AthleteStats, v: string) {
    const n = v === "" ? null : Number(v);
    setStats((s) => ({ ...s, [k]: n }));
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
          onSubmit={salvarEmail}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Mail className="h-5 w-5" /> E-mail
          </h2>
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
          <div className="flex justify-end">
            <Button type="submit" disabled={savingEmail}>
              {savingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Atualizar e-mail
            </Button>
          </div>
        </form>

        <form
          onSubmit={salvarNovaSenha}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Lock className="h-5 w-5" /> Alterar senha
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Confirme sua senha atual antes de definir uma nova.
            </p>
          </div>

          {/* Step 1: current password */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Senha atual</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentVerified) setCurrentVerified(false);
                }}
                placeholder="Digite sua senha atual"
                disabled={currentVerified}
                autoComplete="current-password"
              />
              {!currentVerified ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={verificarSenhaAtual}
                  disabled={verifyingCurrent || !currentPassword}
                >
                  {verifyingCurrent ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Verificar
                </Button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4" /> Verificada
                </span>
              )}
            </div>

            {!currentVerified && (
              <button
                type="button"
                onClick={enviarCodigoEmail}
                disabled={sendingReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
              >
                {sendingReset ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                Não sei minha senha — enviar código por e-mail
              </button>
            )}
          </div>

          {/* Step 2: new password (locked until verified) */}
          <fieldset
            disabled={!currentVerified}
            className={
              "space-y-4 rounded-2xl border border-dashed border-border p-4 transition-opacity " +
              (currentVerified ? "opacity-100" : "opacity-50")
            }
          >
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nova senha</Label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Confirmar nova senha</Label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>
          </fieldset>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                !currentVerified || savingPassword || !newPassword || !confirmPassword
              }
            >
              {savingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Trocar senha
            </Button>
          </div>
        </form>

        {user.role === "atleta" && (
          <form
            onSubmit={salvarAtleta}
            className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <UserCircle2 className="h-5 w-5" /> Perfil de atleta
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Conte sua história, estatísticas e clubes por onde passou. Essas
                informações aparecem no seu perfil público.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold" htmlFor="bio">
                Sobre mim
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Fale um pouco da sua trajetória, estilo de jogo e objetivos."
                rows={5}
                maxLength={2000}
                disabled={loadingAtleta}
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Estatísticas</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatInput
                  label="Jogos"
                  value={stats.jogos}
                  onChange={(v) => setStatField("jogos", v)}
                />
                <StatInput
                  label="Gols"
                  value={stats.gols}
                  onChange={(v) => setStatField("gols", v)}
                />
                <StatInput
                  label="Assistências"
                  value={stats.assistencias}
                  onChange={(v) => setStatField("assistencias", v)}
                />
                <StatInput
                  label="Títulos"
                  value={stats.titulos}
                  onChange={(v) => setStatField("titulos", v)}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <div className="flex items-center justify-between">
                <legend className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="h-4 w-4 text-primary" aria-hidden /> Histórico de
                  clubes
                </legend>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setHistorico((h) => [...h, { clube: "", periodo: "", descricao: "" }])
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> Adicionar
                </Button>
              </div>

              {historico.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Nenhum clube adicionado ainda.
                </p>
              ) : (
                <ul className="space-y-3">
                  {historico.map((h, i) => (
                    <li
                      key={i}
                      className="space-y-2 rounded-2xl border border-border bg-bg2 p-3"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          aria-label={`Nome do clube ${i + 1}`}
                          placeholder="Clube"
                          value={h.clube}
                          onChange={(e) =>
                            setHistorico((arr) =>
                              arr.map((x, j) =>
                                j === i ? { ...x, clube: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <Input
                          aria-label={`Período no clube ${i + 1}`}
                          placeholder="Período (ex.: 2022–2024)"
                          value={h.periodo ?? ""}
                          onChange={(e) =>
                            setHistorico((arr) =>
                              arr.map((x, j) =>
                                j === i ? { ...x, periodo: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <Textarea
                        aria-label={`Descrição do clube ${i + 1}`}
                        placeholder="O que você fez nesse clube?"
                        rows={2}
                        value={h.descricao ?? ""}
                        onChange={(e) =>
                          setHistorico((arr) =>
                            arr.map((x, j) =>
                              j === i ? { ...x, descricao: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remover clube ${i + 1}`}
                          onClick={() =>
                            setHistorico((arr) => arr.filter((_, j) => j !== i))
                          }
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingAtleta}>
                {savingAtleta ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Salvar perfil de atleta
              </Button>
            </div>
          </form>
        )}

        {user.role === "atleta" && (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <AthleteVideoGallery atletaId={user.id} canManage />
          </section>
        )}

      </div>
    </AppLayout>
  );
}

function StatInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-1 text-xs font-semibold text-muted-foreground">
      <span>{label}</span>
      <Input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </label>
  );
}
