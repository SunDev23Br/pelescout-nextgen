import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Building2, Mail, Lock, User, CheckCircle2, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerClube } from "@/lib/user-registry";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/cadastro/clube")({
  head: () => ({
    meta: [
      { title: "Cadastro de Clube — Pelé Next Gen" },
      {
        name: "description",
        content: "Cadastre seu clube na plataforma Pelé Next Gen.",
      },
    ],
  }),
  component: CadastroClubePage,
});

const schema = z
  .object({
    nomeClube: z.string().trim().min(2, "Informe o nome do clube").max(100),
    cnpj: z.string().trim().min(11, "CNPJ/identificação inválido").max(20),
    nome: z.string().trim().min(3, "Informe o nome do responsável").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function CadastroClubePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nomeClube: "",
    cnpj: "",
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function submit(e: FormEvent) {
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
    setTimeout(() => {
      const res = registerClube({
        nomeClube: form.nomeClube,
        cnpj: form.cnpj,
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      });
      setLoading(false);
      if (!res.success) {
        toast.error(res.error ?? "Erro ao cadastrar.");
        return;
      }
      setSuccess(true);
    }, 800);
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
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Cadastro de Clube</h1>
            <p className="text-xs text-muted-foreground">
              Preencha os dados para solicitar acesso como clube.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome do clube" error={errors.nomeClube}>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.nomeClube}
                onChange={(e) => update("nomeClube", e.target.value)}
                placeholder="Ex: FC Estrela do Sul"
                className={`pl-10 ${errors.nomeClube ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="CNPJ ou identificação" error={errors.cnpj}>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.cnpj}
                onChange={(e) => update("cnpj", maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                className={`pl-10 ${errors.cnpj ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="Nome do responsável" error={errors.nome}>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="Nome completo do responsável"
                className={`pl-10 ${errors.nome ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="E-mail" error={errors.email}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="contato@seuclube.com"
                className={`pl-10 ${errors.email ? "border-error ring-error/40" : ""}`}
              />
            </div>
          </Field>

          <Field label="Senha" error={errors.senha}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
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
              <Input
                type="password"
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
