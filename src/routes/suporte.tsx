import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Shield, Building2, User as UserIcon, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Painel de Suporte — Pelé Next Gen" },
      {
        name: "description",
        content: "Painel administrativo para gerenciar papéis dos usuários.",
      },
    ],
  }),
  component: SuportePage,
});

type Role = "atleta" | "admin" | "clube";

interface UserRow {
  id: string;
  nome: string;
  email: string;
  nome_clube: string | null;
  cnpj: string | null;
  created_at: string;
  roles: Role[];
}

interface RequestRow {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  nome: string;
  email: string;
  kind: "admin" | "clube";
}

type RoleFilter = "all" | "atleta" | "admin" | "clube";

function SuportePage() {
  const { user, ready } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  async function load() {
    setLoading(true);
    const [
      { data: profiles },
      { data: roles },
      { data: adminReqs },
      { data: clubeReqs },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, nome, email, nome_clube, cnpj, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase
        .from("admin_requests")
        .select("id, user_id, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("clube_requests")
        .select("id, user_id, status, created_at")
        .order("created_at", { ascending: false }),
    ]);

    const rolesByUser = new Map<string, Role[]>();
    (roles ?? []).forEach((r) => {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role as Role);
      rolesByUser.set(r.user_id, list);
    });

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    setUsers(
      (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesByUser.get(p.id) ?? [],
      }))
    );

    const toRow = (kind: "admin" | "clube") =>
      (r: { id: string; user_id: string; status: string; created_at: string }): RequestRow => {
        const p = profileById.get(r.user_id);
        return {
          id: r.id,
          user_id: r.user_id,
          status: r.status as RequestRow["status"],
          created_at: r.created_at,
          nome: p?.nome ?? "—",
          email: p?.email ?? "—",
          kind,
        };
      };

    setRequests([
      ...(adminReqs ?? []).map(toRow("admin")),
      ...(clubeReqs ?? []).map(toRow("clube")),
    ]);
    setLoading(false);
  }

  useEffect(() => {
    if (user?.role === "suporte") load();
  }, [user?.role]);

  async function approveRequest(req: RequestRow) {
    const rpc = req.kind === "admin" ? "approve_admin_request" : "approve_clube_request";
    const { error } = await supabase.rpc(rpc, { _request_id: req.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      req.kind === "admin" ? "Acesso de administrador aprovado." : "Acesso de clube aprovado."
    );
    load();
  }

  async function rejectRequest(req: RequestRow) {
    // Otimista: remove o card imediatamente
    setRequests((prev) => prev.filter((r) => !(r.id === req.id && r.kind === req.kind)));
    const rpc = req.kind === "admin" ? "reject_admin_request" : "reject_clube_request";
    const { error } = await supabase.rpc(rpc, { _request_id: req.id });
    if (error) {
      toast.error(error.message);
      load();
      return;
    }
    toast.success("Solicitação recusada e removida.");
  }

  async function addRole(userId: string, role: Role) {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Papel "${role}" concedido.`);
    load();
  }

  async function removeRole(userId: string, role: Role) {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Papel "${role}" removido.`);
    load();
  }

  async function deleteUser(userId: string, nome: string) {
    if (!confirm(`Recusar e excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    const { error } = await supabase.functions.invoke("delete-user", { body: { user_id: userId } });
    if (error) {
      toast.error(error.message);
      load();
      return;
    }
    toast.success("Usuário excluído.");
  }

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    if (roleFilter === "atleta") {
      return users.filter(
        (u) => u.roles.includes("atleta") && !u.roles.some((r) => r === "admin" || r === "clube")
      );
    }
    return users.filter((u) => u.roles.includes(roleFilter));
  }, [users, roleFilter]);

  if (!ready) return <AppLayout><div className="py-24 text-center text-muted-foreground">Carregando…</div></AppLayout>;

  if (!user || user.role !== "suporte") {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-muted-foreground">
            Apenas administradores podem acessar este painel.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/login">Ir para login</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">Painel de Suporte</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie os papéis (atleta, clube, admin) de cada usuário cadastrado.
        </p>
      </div>

      {!loading && requests.filter((r) => r.status === "pending").length > 0 && (
        <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="font-display text-xl font-bold text-primary">
            Solicitações de acesso pendentes
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Apenas você (admin) pode aprovar ou rejeitar novos administradores e clubes.
          </p>
          <div className="mt-4 space-y-2">
            {requests
              .filter((r) => r.status === "pending")
              .map((r) => (
                <div
                  key={`${r.kind}-${r.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                          (r.kind === "admin"
                            ? "bg-primary/15 text-primary"
                            : "bg-blue-500/15 text-blue-400")
                        }
                      >
                        {r.kind === "admin" ? <Shield className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {r.kind === "admin" ? "Admin" : "Clube"}
                      </span>
                      <p className="truncate font-semibold">{r.nome}</p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Solicitado em{" "}
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveRequest(r)}>
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectRequest(r)}
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Carregando usuários…</p>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Nenhum usuário cadastrado ainda.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onAdd={(r) => addRole(u.id, r)}
              onRemove={(r) => removeRole(u.id, r)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function UserCard({
  user,
  onAdd,
  onRemove,
}: {
  user: UserRow;
  onAdd: (r: Role) => void;
  onRemove: (r: Role) => void;
}) {
  const has = (r: Role) => user.roles.includes(r);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {has("admin") ? (
            <Shield className="h-5 w-5" />
          ) : has("clube") ? (
            <Building2 className="h-5 w-5" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold">{user.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        {user.nome_clube && <p><strong>Clube:</strong> {user.nome_clube}</p>}
        {user.cnpj && <p><strong>CNPJ:</strong> {user.cnpj}</p>}
        <p><strong>Cadastro:</strong> {new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {user.roles.map((r) => (
          <span
            key={r}
            className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success"
          >
            <CheckCircle2 className="h-3 w-3" /> {r}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["admin", "clube"] as Role[]).map((r) =>
          has(r) ? (
            <Button key={r} variant="outline" size="sm" onClick={() => onRemove(r)}>
              Remover {r}
            </Button>
          ) : (
            <Button key={r} size="sm" onClick={() => onAdd(r)}>
              Tornar {r}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
