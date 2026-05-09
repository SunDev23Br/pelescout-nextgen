import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Mail, Lock, Shield, User, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Role } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      const dest = await destinationFor(data.user.id);
      if (!active) return;
      if (!dest) {
        await supabase.auth.signOut();
        return;
      }
      navigate({ to: dest });
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  /**
   * Retorna a rota de destino conforme o papel selecionado e os papéis reais do usuário.
   * Retorna `null` quando o login deve ser bloqueado (papel incompatível ou
   * cadastro de admin pendente/rejeitado). Quando `selectedRole` é omitido,
   * usa a sessão existente para redirecionar (auto-login na montagem).
   */
  async function destinationFor(
    userId: string,
    selectedRole?: Role,
  ): Promise<string | null> {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = new Set((data ?? []).map((r) => r.role));
    const isSuporte = roles.has("suporte");
    const isAdmin = roles.has("admin");
    const isClube = roles.has("clube");

    // Sem papel selecionado (auto-login): manda para a área de maior privilégio.
    if (!selectedRole) {
      if (isSuporte) return "/suporte";
      if (isAdmin) return "/dashboard";
      if (isClube) return "/clubes";
      return "/peneiras";
    }

    if (selectedRole === "admin") {
      if (isSuporte) return "/suporte";
      if (isAdmin) return "/dashboard";
      // Verifica solicitação para mensagem adequada.
      const { data: req } = await supabase
        .from("admin_requests")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      if (req?.status === "pending") {
        toast.error("Seu cadastro de administrador ainda aguarda aprovação.");
      } else if (req?.status === "rejected") {
        toast.error("Seu cadastro de administrador foi rejeitado.");
      } else {
        toast.error("Esta conta não tem acesso de administrador.");
      }
      return null;
    }

    if (selectedRole === "clube") {
      if (isClube) return "/clubes";
      const { data: req } = await supabase
        .from("clube_requests")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      if (req?.status === "pending") {
        toast.error("Seu cadastro de clube ainda aguarda aprovação.");
      } else if (req?.status === "rejected") {
        toast.error("Seu cadastro de clube foi rejeitado.");
      } else {
        toast.error("Esta conta não está cadastrada como clube.");
      }
      return null;
    }

    // selectedRole === "atleta"
    if (isAdmin || isClube || isSuporte) {
      toast.error("Esta conta não é de atleta. Selecione o tipo correto.");
      return null;
    }
    return "/peneiras";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha email e senha.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setLoading(false);
    if (error || !data.user) {
      toast.error(error?.message ?? "E-mail ou senha incorretos.");
      return;
    }
    const dest = await destinationFor(data.user.id, role);
    if (!dest) {
      await supabase.auth.signOut();
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("png-selected-role", role);
    }
    toast.success("Bem-vindo!");
    navigate({ to: dest });
  }

  async function loginWithGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/login`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setLoading(false);
      toast.error("Falha ao entrar com Google.");
      return;
    }
    if (result.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const dest = await destinationFor(data.user.id, role);
      if (!dest) {
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("png-selected-role", role);
      }
      navigate({ to: dest });
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80"
          alt=""
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
          <p className="mt-2 text-sm text-muted-foreground">Entre na sua conta para continuar.</p>

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

          <p className="mt-3 text-xs text-muted-foreground">
            Use suas credenciais — o tipo de conta é detectado automaticamente.
          </p>

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
                  placeholder="seu@email.com"
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

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={loginWithGoogle}
            disabled={loading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </Button>

          <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Ainda não tem conta?{" "}
              <Link to="/cadastro" className="font-semibold text-primary hover:text-gold-light">
                Cadastre-se como atleta
              </Link>
            </p>
            <p>
              <Link
                to="/registro-admin"
                className="font-semibold text-primary hover:text-gold-light"
              >
                Cadastro de administrador
              </Link>
              {" · "}
              <Link
                to="/registro-clube"
                className="font-semibold text-primary hover:text-gold-light"
              >
                Cadastro de clube
              </Link>
            </p>
          </div>
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
