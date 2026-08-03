import { useRef, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cropToSquareBlob, detectFaces } from "@/lib/avatar-face";
import {
  ESPECIALIDADES_OPCOES,
  POSICOES_OPCOES,
  saveScoutExtra,
  type ScoutExtra,
} from "@/lib/scout-profile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ScoutBase {
  nome: string;
  cidade: string | null;
  celular: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface Props {
  userId: string;
  base: ScoutBase;
  extra: ScoutExtra;
  onCancel: () => void;
  onSaved: (base: ScoutBase, extra: ScoutExtra) => void;
}

export function ScoutProfileEditor({
  userId,
  base,
  extra,
  onCancel,
  onSaved,
}: Props) {
  const [form, setForm] = useState<ScoutBase>({ ...base });
  const [data, setData] = useState<ScoutExtra>({
    ...extra,
    experiencia: extra.experiencia.map((x) => ({ ...x })),
  });
  const [novaCompeticao, setNovaCompeticao] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  async function handleAvatar(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    setUploading(true);
    try {
      const faceResult = await detectFaces(file);
      if (faceResult === "no-face") {
        const proceed = window.confirm(
          "Não detectamos um rosto na foto. O perfil funciona melhor com uma foto de rosto centralizada. Deseja enviar mesmo assim?",
        );
        if (!proceed) return;
      }
      const cropped = await cropToSquareBlob(file, 512);
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, cropped, { upsert: true, contentType: "image/jpeg" });
      if (upErr) {
        toast.error("Falha ao enviar imagem: " + upErr.message);
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      setForm((f) => ({ ...f, avatar_url: pub.publicUrl }));
      toast.success("Foto carregada. Clique em salvar para confirmar.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao processar imagem");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      toast.error("Informe seu nome.");
      return;
    }
    setSaving(true);
    try {
      const cleanBase: ScoutBase = {
        nome: form.nome.trim().slice(0, 120),
        cidade: form.cidade?.trim().slice(0, 120) || null,
        celular: form.celular?.trim().slice(0, 30) || null,
        bio: form.bio?.trim().slice(0, 1200) || null,
        avatar_url: form.avatar_url,
      };
      const cleanExtra: ScoutExtra = {
        ...data,
        cargo: data.cargo?.trim().slice(0, 80) || null,
        instagram: data.instagram?.trim().slice(0, 200) || null,
        linkedin: data.linkedin?.trim().slice(0, 200) || null,
        whatsapp: data.whatsapp?.trim().slice(0, 30) || null,
        email_contato: data.email_contato?.trim().slice(0, 200) || null,
        competicoes: data.competicoes.map((c) => c.slice(0, 60)),
        experiencia: data.experiencia
          .map((x) => ({
            periodo: x.periodo.trim().slice(0, 40),
            cargo: x.cargo.trim().slice(0, 120),
          }))
          .filter((x) => x.periodo || x.cargo),
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          nome: cleanBase.nome,
          cidade: cleanBase.cidade,
          celular: cleanBase.celular,
          bio: cleanBase.bio,
          avatar_url: cleanBase.avatar_url,
        })
        .eq("id", userId);
      if (error) throw new Error(error.message);

      await saveScoutExtra(userId, cleanExtra);
      window.dispatchEvent(new Event("png-session"));
      toast.success("Perfil de olheiro atualizado!");
      onSaved(cleanBase, cleanExtra);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-28">
      <header>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
          Editar perfil de olheiro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tudo que você preencher aqui aparece no seu perfil público.
        </p>
      </header>

      <Section title="Identidade">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <AthleteAvatar
            src={form.avatar_url ?? undefined}
            alt={form.nome}
            className="h-24 w-24 border-2 border-primary/40"
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => void handleAvatar(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {form.avatar_url ? "Trocar foto" : "Enviar foto"}
            </Button>
            {form.avatar_url && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm((f) => ({ ...f, avatar_url: null }))}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remover
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <Input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </Field>
          <Field label="Cargo / título">
            <Input
              placeholder="Scout Profissional"
              value={data.cargo ?? ""}
              onChange={(e) => setData((d) => ({ ...d, cargo: e.target.value }))}
            />
          </Field>
          <Field label="Cidade / UF">
            <Input
              placeholder="São Paulo - SP"
              value={form.cidade ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
            />
          </Field>
          <Field label="Celular">
            <Input
              placeholder="(11) 99999-0000"
              value={form.celular ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, celular: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Sobre mim">
            <Textarea
              rows={5}
              placeholder="Conte sua trajetória, metodologia de observação e o que você busca em um atleta."
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </Field>
        </div>
      </Section>

      <Section title="Especialidades">
        <div className="flex flex-wrap gap-2">
          {ESPECIALIDADES_OPCOES.map((op) => {
            const on = data.especialidades.includes(op);
            return (
              <button
                key={op}
                type="button"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    especialidades: toggle(d.especialidades, op),
                  }))
                }
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
                  on
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-bg2 text-muted-foreground hover:border-primary/30",
                )}
              >
                {op}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Posições observadas">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {POSICOES_OPCOES.map((p) => {
            const on = data.posicoes.includes(p.label);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  setData((d) => ({ ...d, posicoes: toggle(d.posicoes, p.label) }))
                }
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  on
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-bg2 hover:border-primary/30",
                )}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-sm font-semibold">{p.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Competições acompanhadas">
        <div className="flex flex-wrap gap-2">
          {data.competicoes.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg2 px-3 py-2 text-xs font-bold"
            >
              {c}
              <button
                type="button"
                aria-label={`Remover ${c}`}
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    competicoes: d.competicoes.filter((_, idx) => idx !== i),
                  }))
                }
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {data.competicoes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma competição adicionada.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Ex.: Copinha"
            value={novaCompeticao}
            onChange={(e) => setNovaCompeticao(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = novaCompeticao.trim();
                if (!v) return;
                setData((d) => ({ ...d, competicoes: [...d.competicoes, v] }));
                setNovaCompeticao("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const v = novaCompeticao.trim();
              if (!v) return;
              setData((d) => ({ ...d, competicoes: [...d.competicoes, v] }));
              setNovaCompeticao("");
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </Section>

      <Section title="Experiência">
        <div className="space-y-3">
          {data.experiencia.map((x, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl border border-border bg-bg2 p-3 sm:grid-cols-[140px_1fr_auto]"
            >
              <Input
                placeholder="2022 – 2025"
                value={x.periodo}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    experiencia: d.experiencia.map((it, idx) =>
                      idx === i ? { ...it, periodo: e.target.value } : it,
                    ),
                  }))
                }
              />
              <Input
                placeholder="Cargo / clube"
                value={x.cargo}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    experiencia: d.experiencia.map((it, idx) =>
                      idx === i ? { ...it, cargo: e.target.value } : it,
                    ),
                  }))
                }
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Mover para cima"
                  disabled={i === 0}
                  onClick={() =>
                    setData((d) => {
                      const arr = [...d.experiencia];
                      const prev = arr[i - 1]!;
                      const cur = arr[i]!;
                      arr[i - 1] = cur;
                      arr[i] = prev;
                      return { ...d, experiencia: arr };
                    })
                  }
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Mover para baixo"
                  disabled={i === data.experiencia.length - 1}
                  onClick={() =>
                    setData((d) => {
                      const arr = [...d.experiencia];
                      const next = arr[i + 1]!;
                      const cur = arr[i]!;
                      arr[i + 1] = cur;
                      arr[i] = next;
                      return { ...d, experiencia: arr };
                    })
                  }
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover item"
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      experiencia: d.experiencia.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {data.experiencia.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma experiência adicionada.
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() =>
            setData((d) => ({
              ...d,
              experiencia: [...d.experiencia, { periodo: "", cargo: "" }],
            }))
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar experiência
        </Button>
      </Section>

      <Section title="Contato e disponibilidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp (somente números)">
            <Input
              placeholder="11999990000"
              value={data.whatsapp ?? ""}
              onChange={(e) =>
                setData((d) => ({ ...d, whatsapp: e.target.value }))
              }
            />
          </Field>
          <Field label="E-mail de contato">
            <Input
              type="email"
              placeholder="contato@exemplo.com"
              value={data.email_contato ?? ""}
              onChange={(e) =>
                setData((d) => ({ ...d, email_contato: e.target.value }))
              }
            />
          </Field>
          <Field label="Instagram">
            <Input
              placeholder="@seuperfil"
              value={data.instagram ?? ""}
              onChange={(e) =>
                setData((d) => ({ ...d, instagram: e.target.value }))
              }
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              placeholder="seu-usuario"
              value={data.linkedin ?? ""}
              onChange={(e) =>
                setData((d) => ({ ...d, linkedin: e.target.value }))
              }
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={() => setData((d) => ({ ...d, disponivel: !d.disponivel }))}
          className={cn(
            "mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
            data.disponivel
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
              : "border-red-500/40 bg-red-500/10 text-red-500",
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              data.disponivel ? "bg-emerald-500" : "bg-red-500",
            )}
          />
          {data.disponivel ? "Recebendo vídeos" : "Agenda fechada"}
        </button>
      </Section>

      <div className="sticky bottom-4 z-10 flex gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-card backdrop-blur">
        <Button
          className="flex-1"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
        <Button variant="outline" disabled={saving} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-xs font-bold uppercase tracking-[0.22em] text-primary">
        {title}
      </h2>
      <div className="mt-2 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
