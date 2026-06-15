import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { ArrowLeft, Shield, Mail, Lock, User, CheckCircle2, Phone, Calendar, Building2, IdCard, Upload, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/registro-admin")({
  head: () => ({
    meta: [
      { title: "Cadastro de Administrador — Pelé Next Gen" },
      {
        name: "description",
        content: "Crie sua conta de administrador na plataforma Pelé Next Gen.",
      },
    ],
  }),
  component: CadastroAdminPage,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
  .instanceof(File, { message: "Envie uma imagem" })
  .refine((f) => f.size <= MAX_FILE_SIZE, "Imagem deve ter no máximo 5 MB")
  .refine((f) => ALLOWED_MIME.includes(f.type), "Formato inválido (use JPG, PNG ou WEBP)");

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    celular: z
      .string()
      .trim()
      .min(10, "Celular inválido")
      .max(20)
      .regex(/^[0-9()\-\s+]+$/, "Use apenas números e símbolos de telefone"),
    idade: z
      .number({ invalid_type_error: "Informe a idade" })
      .int()
      .min(18, "Idade mínima 18 anos")
      .max(99, "Idade máxima 99 anos"),
    clubeAtual: z.string().trim().min(2, "Informe o clube").max(120),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
    confirmarSenha: z.string(),
    rgFrente: fileSchema,
    rgVerso: fileSchema,
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

function getExt(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function CadastroAdminPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    idade: "",
    clubeAtual: "",
    senha: "",
    confirmarSenha: "",
  });
  const [rgFrente, setRgFrente] = useState<File | null>(null);
  const [rgVerso, setRgVerso] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({
      ...form,
      idade: form.idade ? Number(form.idade) : Number.NaN,
      rgFrente,
      rgVerso,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Corrija os campos destacados.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { nome: form.nome },
      },
    });
    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Falha ao criar conta.");
      return;
    }

    const userId = data.user.id;

    // Upload RG frente e verso
    const frenteExt = getExt(rgFrente!);
    const versoExt = getExt(rgVerso!);
    const frentePath = `${userId}/rg-frente.${frenteExt}`;
    const versoPath = `${userId}/rg-verso.${versoExt}`;

    const [{ error: upFrenteErr }, { error: upVersoErr }] = await Promise.all([
      supabase.storage
        .from("admin-docs")
        .upload(frentePath, rgFrente!, { upsert: true, contentType: rgFrente!.type }),
      supabase.storage
        .from("admin-docs")
        .upload(versoPath, rgVerso!, { upsert: true, contentType: rgVerso!.type }),
    ]);

    if (upFrenteErr || upVersoErr) {
      setLoading(false);
      await supabase.auth.signOut();
      toast.error("Falha ao enviar as imagens do RG. Tente novamente.");
      return;
    }

    const { error: reqErr } = await supabase.from("admin_requests").insert({
      user_id: userId,
      status: "pending",
      celular: form.celular,
      idade: Number(form.idade),
      clube_atual: form.clubeAtual,
      rg_frente_path: frentePath,
      rg_verso_path: versoPath,
    } as never);

    if (reqErr && reqErr.code !== "23505") {
      setLoading(false);
      await supabase.auth.signOut();
      toast.error(reqErr.message);
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold">Cadastro enviado!</h1>
          <p className="mt-3 text-muted-foreground">
            Seu cadastro foi recebido com sucesso. Aguarde o suporte para liberação de acesso.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Você receberá uma notificação quando seu acesso for ativado.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/login">Voltar para login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Link>

        <Logo className="mb-6" />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Cadastro de Administrador</h1>
            <p className="text-xs text-muted-foreground">
              Preencha os dados para solicitar acesso administrativo.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome completo" error={errors.nome}>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="Seu nome completo"
                className={`pl-10 ${errors.nome ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="E-mail institucional" error={errors.email}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="admin@pelenextgen.com"
                className={`pl-10 ${errors.email ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="Celular" error={errors.celular}>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                value={form.celular}
                onChange={(e) => update("celular", e.target.value)}
                placeholder="(11) 99999-9999"
                className={`pl-10 ${errors.celular ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Idade" error={errors.idade}>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min={18}
                  max={99}
                  value={form.idade}
                  onChange={(e) => update("idade", e.target.value)}
                  placeholder="30"
                  className={`pl-10 ${errors.idade ? "border-error ring-error/40" : ""}`}
                />
              </div>
            </Field>

            <Field label="Clube" error={errors.clubeAtual}>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.clubeAtual}
                  onChange={(e) => update("clubeAtual", e.target.value)}
                  placeholder="Clube atual/anterior"
                  className={`pl-10 ${errors.clubeAtual ? "border-error ring-error/40" : ""}`}
                />
              </div>
            </Field>
          </div>

          <Field label="Senha" error={errors.senha}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                value={form.senha}
                onChange={(e) => update("senha", e.target.value)}
                placeholder="••••••••"
                className={`pl-10 ${errors.senha ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="Confirmar senha" error={errors.confirmarSenha}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                value={form.confirmarSenha}
                onChange={(e) => update("confirmarSenha", e.target.value)}
                placeholder="••••••••"
                className={`pl-10 ${errors.confirmarSenha ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <div className="space-y-3 rounded-xl border border-border bg-card/40 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <IdCard className="h-4 w-4 text-primary" />
              Documento de identidade (RG)
            </div>
            <p className="-mt-1 text-xs text-muted-foreground">
              Envie fotos legíveis da frente e do verso. JPG, PNG ou WEBP até 5 MB.
            </p>
            <FileField
              label="RG — Frente"
              file={rgFrente}
              onChange={(f) => {
                setRgFrente(f);
                setErrors((e) => ({ ...e, rgFrente: "" }));
              }}
              error={errors.rgFrente}
            />
            <FileField
              label="RG — Verso"
              file={rgVerso}
              onChange={(f) => {
                setRgVerso(f);
                setErrors((e) => ({ ...e, rgVerso: "" }));
              }}
              error={errors.rgVerso}
            />
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <strong className="text-primary">Importante:</strong> O cadastro não concede acesso
            imediato. Após o envio, o suporte validará seus dados e liberará o acesso.
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
            variant={Object.values(errors).some(Boolean) ? "error" : "default"}
          >
            {loading ? "Enviando..." : "Solicitar cadastro"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          É um atleta?{" "}
          <Link to="/cadastro" className="font-semibold text-primary hover:text-gold-light">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={error ? "text-error" : ""}>{label}</Label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function FileField({
  label,
  file,
  onChange,
  error,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  function handle(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
  }

  return (
    <div className="space-y-1.5">
      <Label className={error ? "text-error" : ""}>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handle}
        className="hidden"
      />
      {file && previewUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <img src={previewUrl} alt={label} className="h-32 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
            aria-label="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="truncate bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
            {file.name}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition ${
            error
              ? "border-error text-error"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Upload className="h-4 w-4" />
          Enviar imagem
        </button>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
