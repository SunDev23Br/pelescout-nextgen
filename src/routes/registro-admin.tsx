import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Shield, Mail, Lock, User, CheckCircle2 } from "lucide-react";
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

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

function CadastroAdminPage() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
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
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Cria solicitação de acesso administrativo (status pendente).
    if (data.user) {
      const { error: reqErr } = await supabase
        .from("admin_requests")
        .insert({ user_id: data.user.id, status: "pending" });
      if (reqErr && reqErr.code !== "23505") {
        // 23505 = unique_violation (já existe solicitação)
        console.error(reqErr);
      }
    }

    // Encerra a sessão criada automaticamente pelo signUp para impedir
    // que o usuário entre na plataforma antes da aprovação.
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
