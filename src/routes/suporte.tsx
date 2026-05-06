import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Shield, Building2, Eye, KeyRound } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  activateUser,
  getAllUsers,
  type RegisteredUser,
} from "@/lib/user-registry";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Painel de Suporte — Pelé Next Gen" },
      {
        name: "description",
        content: "Painel administrativo para ativação de cadastros pendentes.",
      },
    ],
  }),
  component: SuportePage,
});

function SuportePage() {
  const { user } = useSession();
  const [users, setUsers] = useState<RegisteredUser[]>(getAllUsers());
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});

  // Only admin master can access
  if (!user || user.role !== "admin") {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-muted-foreground">
            Apenas administradores master podem acessar este painel.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/login">Ir para login</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  function handleActivate(userId: string) {
    const ok = activateUser(userId);
    if (ok) {
      toast.success("Usuário ativado com sucesso!");
      setUsers(getAllUsers());
    } else {
      toast.error("Erro ao ativar usuário.");
    }
  }

  function toggleToken(userId: string) {
    setShowToken((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  const pending = users.filter((u) => u.status === "pendente");
  const active = users.filter((u) => u.status === "ativo");

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">Painel de Suporte</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie cadastros pendentes e ative o acesso de administradores e clubes.
        </p>
      </div>

      {/* Pending users */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Clock className="h-5 w-5 text-warning" />
          Cadastros pendentes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Nenhum cadastro pendente no momento.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                showTokenValue={showToken[u.id] ?? false}
                onToggleToken={() => toggleToken(u.id)}
                onActivate={() => handleActivate(u.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Active users */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Usuários ativos ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Nenhum usuário ativo ainda.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                showTokenValue={showToken[u.id] ?? false}
                onToggleToken={() => toggleToken(u.id)}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function UserCard({
  user,
  showTokenValue,
  onToggleToken,
  onActivate,
}: {
  user: RegisteredUser;
  showTokenValue: boolean;
  onToggleToken: () => void;
  onActivate?: () => void;
}) {
  const isPending = user.status === "pendente";
  const RoleIcon = user.role === "admin" ? Shield : Building2;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              user.role === "admin" ? "bg-primary/15 text-primary" : "bg-blue-dark/30 text-foreground"
            }`}
          >
            <RoleIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-bold text-sm">{user.nome}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            isPending
              ? "bg-warning/20 text-warning"
              : "bg-success/20 text-success"
          }`}
        >
          {user.status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <p>
          <strong>Tipo:</strong> {user.role === "admin" ? "Administrador" : "Clube"}
        </p>
        {user.nomeClube && (
          <p>
            <strong>Clube:</strong> {user.nomeClube}
          </p>
        )}
        {user.cnpj && (
          <p>
            <strong>CNPJ:</strong> {user.cnpj}
          </p>
        )}
        <p>
          <strong>Cadastro:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Token section */}
      <div className="mt-3 rounded-lg border border-border bg-bg2 p-2">
        <button
          onClick={onToggleToken}
          className="flex w-full items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Token de acesso
          <Eye className="ml-auto h-3.5 w-3.5" />
        </button>
        {showTokenValue && (
          <p className="mt-1.5 break-all font-mono text-[10px] text-primary">
            {user.token}
          </p>
        )}
      </div>

      {isPending && onActivate && (
        <Button onClick={onActivate} className="mt-4 w-full" size="sm">
          Ativar acesso
        </Button>
      )}
    </div>
  );
}
