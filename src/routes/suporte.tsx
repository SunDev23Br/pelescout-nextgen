import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Shield, Building2, User as UserIcon, Trash2, Filter, Users, Phone, Calendar, IdCard, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/storage";
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
  celular?: string | null;
  idade?: number | null;
  clube_atual?: string | null;
  rg_frente_path?: string | null;
  rg_verso_path?: string | null;
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
        .select("id, user_id, status, created_at, celular, idade, clube_atual, rg_frente_path, rg_verso_path")
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
      (r: {
        id: string;
        user_id: string;
        status: string;
        created_at: string;
        celular?: string | null;
        idade?: number | null;
        clube_atual?: string | null;
        rg_frente_path?: string | null;
        rg_verso_path?: string | null;
      }): RequestRow => {
        const p = profileById.get(r.user_id);
        return {
          id: r.id,
          user_id: r.user_id,
          status: r.status as RequestRow["status"],
          created_at: r.created_at,
          nome: p?.nome ?? "—",
          email: p?.email ?? "—",
          kind,
          celular: r.celular ?? null,
          idade: r.idade ?? null,
          clube_atual: r.clube_atual ?? null,
          rg_frente_path: r.rg_frente_path ?? null,
          rg_verso_path: r.rg_verso_path ?? null,
        };
      };

    setRequests([
      ...((adminReqs as never[] | null) ?? []).map(toRow("admin")),
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
    const base = users.filter((u) => !u.roles.some((r) => (r as string) === "suporte"));
    if (roleFilter === "all") return base;
    if (roleFilter === "atleta") {
      return base.filter(
        (u) => u.roles.includes("atleta") && !u.roles.some((r) => r === "admin" || r === "clube")
      );
    }
    return base.filter((u) => u.roles.includes(roleFilter));
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
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
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
                  {r.kind === "admin" && (r.celular || r.idade || r.clube_atual || r.rg_frente_path || r.rg_verso_path) && (
                    <AdminRequestDetails req={r} />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <div
        role="region"
        aria-label="Filtrar usuários"
        className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
      >
        <div className="flex items-center gap-2 text-foreground">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary"
          >
            <Filter className="h-4 w-4" />
          </span>
          <label
            htmlFor="role-filter"
            className="text-sm font-bold uppercase tracking-wider"
          >
            Filtrar por papel
          </label>
        </div>

        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as RoleFilter)}
        >
          <SelectTrigger
            id="role-filter"
            aria-label="Selecionar papel para filtrar a lista de usuários"
            className="h-11 min-w-[180px] rounded-xl border-2 text-base font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <SelectValue placeholder="Selecione…" />
          </SelectTrigger>
          <SelectContent className="text-base">
            <SelectItem value="all" className="py-2.5">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                Todos os usuários
              </span>
            </SelectItem>
            <SelectItem value="atleta" className="py-2.5">
              <span className="inline-flex items-center gap-2">
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                Atletas
              </span>
            </SelectItem>
            <SelectItem value="admin" className="py-2.5">
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Administradores
              </span>
            </SelectItem>
            <SelectItem value="clube" className="py-2.5">
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Clubes
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <p
          aria-live="polite"
          className="ml-auto rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground"
        >
          {filteredUsers.length}{" "}
          <span className="text-muted-foreground">
            {filteredUsers.length === 1 ? "usuário" : "usuários"}
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando usuários…</p>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onAdd={(r) => addRole(u.id, r)}
              onRemove={(r) => removeRole(u.id, r)}
              onDelete={() => deleteUser(u.id, u.nome)}
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
  onDelete,
}: {
  user: UserRow;
  onAdd: (r: Role) => void;
  onRemove: (r: Role) => void;
  onDelete: () => void;
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

      <div className="mt-4 flex flex-wrap gap-2">
        {has("admin") ? (
          <Button variant="outline" size="sm" onClick={() => onRemove("admin")}>
            Remover admin
          </Button>
        ) : (
          <Button size="sm" onClick={() => onAdd("admin")}>
            Tornar admin
          </Button>
        )}
        {!user.roles.some((r) => (r as string) === "suporte") && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="ml-auto"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Recusar
          </Button>
        )}
      </div>
    </div>
  );
}

function AdminRequestDetails({ req }: { req: RequestRow }) {
  const [frenteUrl, setFrenteUrl] = useState<string | null>(null);
  const [versoUrl, setVersoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadUrls() {
      if (req.rg_frente_path) {
        const url = await getSignedUrl("admin-docs", req.rg_frente_path, 600);
        if (!cancelled) setFrenteUrl(url);
      }
      if (req.rg_verso_path) {
        const url = await getSignedUrl("admin-docs", req.rg_verso_path, 600);
        if (!cancelled) setVersoUrl(url);
      }
    }
    loadUrls();
    return () => {
      cancelled = true;
    };
  }, [req.rg_frente_path, req.rg_verso_path]);

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        {req.celular && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{req.celular}</span>
          </div>
        )}
        {req.idade != null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{req.idade} anos</span>
          </div>
        )}
        {req.clube_atual && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="truncate font-medium text-foreground">{req.clube_atual}</span>
          </div>
        )}
      </div>

      {(req.rg_frente_path || req.rg_verso_path) && (
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <IdCard className="h-3.5 w-3.5" />
            Documento de identidade
          </div>
          <div className="grid grid-cols-2 gap-2">
            <RgThumb label="Frente" url={frenteUrl} />
            <RgThumb label="Verso" url={versoUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

function RgThumb({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-muted-foreground">
        {label} indisponível
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-lg border border-border"
    >
      <img src={url} alt={`RG ${label}`} className="h-24 w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition group-hover:opacity-100">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
          <ExternalLink className="h-3.5 w-3.5" /> Abrir {label}
        </span>
      </div>
    </a>
  );
}
