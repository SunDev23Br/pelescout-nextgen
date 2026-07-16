import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Menu,
  MessageCircle,
  X,
  PlusCircle,
  Building2,
  UserCog,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import { Logo } from "./Logo";
import { AthleteAvatar } from "./AthleteAvatar";
import { useSession, clearSession, type Role } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "suporte"] },
  { to: "/peneiras", label: "Peneiras", icon: Trophy, roles: ["admin", "atleta", "clube", "suporte"] },
  { to: "/peneiras/criar", label: "Criar peneira", icon: PlusCircle, roles: ["admin", "clube"] },
  { to: "/candidatos", label: "Candidatos", icon: Users, roles: ["admin", "suporte"] },
  { to: "/avaliacoes", label: "Avaliações ao vivo", icon: ClipboardCheck, roles: ["admin"] },
  { to: "/chat", label: "Mensagens", icon: MessageCircle, roles: ["admin", "atleta", "clube"] },
  { to: "/suporte", label: "Suporte / Acessos", icon: ShieldCheck, roles: ["suporte"] },
  { to: "/clubes", label: "Atletas aprovados", icon: Building2, roles: ["clube"] },
  { to: "/manual", label: "Manual do Atleta", icon: BookOpen, roles: ["atleta"] },
  { to: "/perfil-atleta", label: "Meu perfil de atleta", icon: UserCog, roles: ["atleta"] },
  { to: "/desempenho", label: "Desempenho", icon: LineChart, roles: ["atleta"] },
  { to: "/perfil", label: "Configurações da conta", icon: UserCog, roles: ["admin", "clube", "suporte"] },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Olheiro / Admin",
  atleta: "Atleta",
  clube: "Clube",
  suporte: "Suporte",
};

const ROLE_AREA: Record<Role, string> = {
  admin: "Painel administrativo",
  atleta: "Área do atleta",
  clube: "Área do clube",
  suporte: "Painel de suporte",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const role: Role | null = user?.role ?? null;
  const items = role ? NAV.filter((i) => i.roles.includes(role)) : [];

  const handleLogout = async () => {
    await clearSession();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg2/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground"
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="hidden h-28 items-center border-b border-border px-6 lg:flex">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-20 lg:pt-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {role ? ROLE_AREA[role] : "\u00A0"}
          </p>
          <nav className="space-y-1" aria-busy={!ready}>
            {!ready ? (
              <div className="space-y-1.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-xl bg-sidebar-accent/40"
                  />
                ))}
              </div>
            ) : (
              items.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.to ||
                  (item.to !== "/" && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-primary/25 to-primary/5 text-primary shadow-[inset_3px_0_0_0_var(--gold)] ring-1 ring-primary/20"
                        : "text-foreground/80 hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-foreground/60 group-hover:text-foreground")} />
                    {item.label}
                  </Link>
                );
              })
            )}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          {user && (
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="mb-3 flex items-center gap-3 rounded-xl bg-bg3 p-3 transition-colors hover:bg-sidebar-accent"
            >
              <AthleteAvatar
                src={user.avatarUrl ?? undefined}
                alt={user.nome}
                className="h-10 w-10 shrink-0 border border-primary/30"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{role ? ROLE_LABEL[role] : ""}</p>
              </div>
            </Link>
          )}
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Content */}
      <main className="flex-1 lg:pl-72">
        <div className="px-4 pb-12 pt-20 sm:px-6 lg:px-10 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
