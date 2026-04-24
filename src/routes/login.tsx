import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, Lock, Shield, User, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSession, type Role } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Pelé Next Gen" },
      { name: "description", content: "Acesse sua conta na Pelé Next Gen." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("atleta");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha email e senha.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const slug = email.split("@")[0];
      const nome =
        role === "clube"
          ? `Clube ${slug.charAt(0).toUpperCase() + slug.slice(1)}`
          : slug
              .split(".")
              .map((s) => s[0]?.toUpperCase() + s.slice(1))
              .join(" ") || "Usuário";
      setSession({
        nome,
        email,
        role,
        contatosDesbloqueados: role === "clube" ? [] : undefined,
      });
      toast.success(`Bem-vindo, ${nome}!`);
      const dest =
        role === "admin" ? "/dashboard" : role === "clube" ? "/clubes" : "/peneiras";
      navigate({ to: dest });
    }, 600);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1400&q=80"
          alt="Estádio iluminado"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/70 to-blue-dark/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Logo />
          <div>
            <h2 className="max-w-md font-display text-4xl font-extrabold leading-tight">
              A nova geração do <span className="text-gradient-gold">futebol</span> começa aqui!
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Entre na plataforma para gerenciar peneiras, candidatos e avaliações em tempo real.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao início
          </Link>

          <div className="lg:hidden">
            <Logo className="mb-8" />
          </div>

          <h1 className="font-display text-3xl font-extrabold">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre na sua conta para continuar.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-border bg-bg2 p-1">
            <RoleButton
              active={role === "atleta"}
              onClick={() => setRole("atleta")}
              icon={<User className="h-4 w-4" />}
              label="Atleta"
            />
            <RoleButton
              active={role === "clube"}
              onClick={() => setRole("clube")}
              icon={<Building2 className="h-4 w-4" />}
              label="Clube"
            />
            <RoleButton
              active={role === "admin"}
              onClick={() => setRole("admin")}
              icon={<Shield className="h-4 w-4" />}
              label="Admin"
            />
          </div>

          {role === "clube" && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
              <strong className="text-primary">Área de clubes.</strong> Visualize atletas
              aprovados nas peneiras. Os dados de contato (e-mail e celular) são liberados
              mediante pagamento por atleta.
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "clube" ? "contato@seuclube.com" : "seu@email.com"
                  }
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              to="/cadastro"
              className="font-semibold text-primary hover:text-gold-light"
            >
              Cadastre-se como atleta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors " +
        (active
          ? "bg-primary text-primary-foreground shadow"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {icon}
      {label}
    </button>
  );
}
