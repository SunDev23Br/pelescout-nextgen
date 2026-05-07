import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Camera, Trash2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro de atleta — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Crie sua conta de atleta na Pelé Next Gen e participe das peneiras oficiais.",
      },
    ],
  }),
  component: CadastroPage,
});

const schema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  celular: z
    .string()
    .trim()
    .min(10, "Celular inválido")
    .max(20, "Celular inválido")
    .regex(/[\d\s()+\-]+/, "Use apenas números e (), +, -"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
  idade: z.coerce.number().int().min(8, "Idade mínima 8").max(40, "Idade máxima 40"),
  altura: z.coerce.number().min(120, "Altura em cm").max(230),
  peso: z.coerce.number().min(25, "Peso em kg").max(150),
  posicao: z.string().min(1, "Selecione a posição"),
  pe: z.enum(["Destro", "Canhoto"]),
});

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

function maskCelular(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    senha: "",
    idade: "",
    altura: "",
    peso: "",
    posicao: "",
    pe: "Destro" as "Destro" | "Canhoto",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<string>("");
  const fotoInputRef = useRef<HTMLInputElement>(null);

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFoto(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function removerFoto() {
    setFoto("");
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  }


  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as string;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Verifique os campos do formulário.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          nome: form.nome,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cadastro concluído! Bem-vindo à Pelé Next Gen.");
    navigate({ to: "/manual" });
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para login
          </Link>
          <Logo />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Novo atleta
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Crie sua conta de atleta
            </h1>
            <p className="mt-2 text-muted-foreground">
              Preencha os dados abaixo. Eles serão usados pelos olheiros para acompanhar seu
              desempenho durante as peneiras.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-8">
            <div>
              <h2 className="mb-4 font-display text-lg font-bold">Foto de perfil</h2>
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-bg2/40 p-6 sm:flex-row sm:items-center sm:gap-6">
                <AthleteAvatar
                  src={foto}
                  alt="Sua foto"
                  className="h-24 w-24 border-2 border-primary/40 shadow-card"
                />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-sm font-semibold">Adicione uma foto sua</p>
                  <p className="text-xs text-muted-foreground">
                    Use uma foto recente, do rosto, em boa iluminação. PNG ou JPG até 5MB.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fotoInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {foto ? "Trocar foto" : "Enviar foto"}
                    </Button>
                    {foto && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removerFoto}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remover
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </div>
              </div>
            </div>

            <Section title="Dados pessoais">
              <Field label="Nome completo" error={errors.nome} className="sm:col-span-2">
                <Input
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  placeholder="Ex: João Pedro Silva"
                />
              </Field>
              <Field label="E-mail" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="seu@email.com"
                />
              </Field>
              <Field label="Celular (WhatsApp)" error={errors.celular}>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={form.celular}
                  onChange={(e) => update("celular", maskCelular(e.target.value))}
                  placeholder="(11) 98765-4321"
                  maxLength={20}
                />
              </Field>
              <Field label="Senha" error={errors.senha} className="sm:col-span-2">
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => update("senha", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </Field>
            </Section>

            <Section title="Perfil esportivo">
              <Field label="Idade" error={errors.idade}>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.idade}
                  onChange={(e) => update("idade", e.target.value)}
                  placeholder="16"
                />
              </Field>
              <Field label="Altura (cm)" error={errors.altura}>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.altura}
                  onChange={(e) => update("altura", e.target.value)}
                  placeholder="178"
                />
              </Field>
              <Field label="Peso (kg)" error={errors.peso}>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.peso}
                  onChange={(e) => update("peso", e.target.value)}
                  placeholder="68"
                />
              </Field>

              <Field label="Posição" error={errors.posicao}>
                <Select value={form.posicao} onValueChange={(v) => update("posicao", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSICOES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Pé preferencial" error={errors.pe} className="sm:col-span-2">
                <RadioGroup
                  value={form.pe}
                  onValueChange={(v) => update("pe", v as "Destro" | "Canhoto")}
                  className="flex gap-3"
                >
                  {(["Destro", "Canhoto"] as const).map((opt) => (
                    <label
                      key={opt}
                      htmlFor={`pe-${opt}`}
                      className={
                        "flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors " +
                        (form.pe === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-bg2 text-muted-foreground hover:text-foreground")
                      }
                    >
                      <RadioGroupItem value={opt} id={`pe-${opt}`} />
                      <span className="font-semibold">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            </Section>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to="/login">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                variant={Object.values(errors).some(Boolean) ? "error" : "default"}
              >
                {loading ? (
                  "Criando conta..."
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {Object.values(errors).some(Boolean)
                      ? "Preencha os campos obrigatórios"
                      : "Criar conta de atleta"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-2 " + (className ?? "")}>
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
