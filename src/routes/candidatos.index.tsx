import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Input } from "@/components/ui/input";
import { candidatos } from "@/lib/mock-data";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/candidatos/")({
  head: () => ({
    meta: [
      { title: "Candidatos — Pelé Next Gen" },
      { name: "description", content: "Lista de candidatos inscritos nas peneiras." },
    ],
  }),
  component: CandidatosPage,
});

const STATUS_TABS = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "avaliado", label: "Avaliados" },
  { value: "aprovado", label: "Aprovados" },
] as const;

function CandidatosPage() {
  const { user } = useSession();
  const isClube = user?.role === "clube";
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]["value"]>(
    isClube ? "aprovado" : "todos",
  );
  const effectiveStatus = isClube ? "aprovado" : status;

  const list = useMemo(() => {
    return candidatos.filter((c) => {
      if (effectiveStatus !== "todos" && c.status !== effectiveStatus) return false;
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      return (
        c.nome.toLowerCase().includes(t) ||
        c.posicao.toLowerCase().includes(t) ||
        c.cidade.toLowerCase().includes(t)
      );
    });
  }, [q, effectiveStatus]);

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Candidatos
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Atletas inscritos
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isClube
            ? "Pré-visualização dos atletas aprovados. Para acessar os perfis completos e contatos, vá em \"Atletas aprovados\"."
            : "Acompanhe os candidatos das peneiras ativas e suas avaliações."}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, posição ou cidade..."
            className="pl-10"
          />
        </div>
        {!isClube && (
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg2 p-1">
            {STATUS_TABS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors " +
                  (status === s.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-bg2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Atleta</th>
              <th className="px-5 py-3">Posição</th>
              <th className="hidden px-5 py-3 md:table-cell">Idade</th>
              <th className="hidden px-5 py-3 lg:table-cell">Cidade</th>
              <th className="px-5 py-3">Nota</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr
                key={c.id}
                className="border-t border-border transition-colors hover:bg-bg2"
              >
                <td className="px-5 py-3">
                  {isClube ? (
                    <div
                      className="flex items-center gap-3 font-semibold text-muted-foreground"
                      aria-label="Acesso restrito — pré-visualização"
                      title="Pré-visualização. Acesse via Atletas aprovados."
                    >
                      <AthleteAvatar
                        src={c.avatar}
                        alt={c.nome}
                        className="h-9 w-9 border border-border opacity-70"
                      />
                      <span className="blur-[3px] select-none">{c.nome}</span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ) : (
                    <Link
                      to="/candidatos/$candidatoId"
                      params={{ candidatoId: c.id }}
                      className="flex items-center gap-3 font-semibold hover:text-primary"
                    >
                      <AthleteAvatar
                        src={c.avatar}
                        alt={c.nome}
                        className="h-9 w-9 border border-border"
                      />
                      {c.nome}
                    </Link>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{c.posicao}</td>
                <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                  {c.idade} anos
                </td>
                <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">
                  {c.cidade}
                </td>
                <td className="px-5 py-3 font-bold text-gradient-gold">
                  {c.notaGeral?.toFixed(1) ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <CandStatus status={c.status} />
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-muted-foreground"
                >
                  Nenhum candidato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

function CandStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendente: "bg-muted-foreground/15 text-muted-foreground",
    avaliado: "bg-blue-light/15 text-blue-light",
    aprovado: "bg-success/15 text-success",
    reprovado: "bg-destructive/15 text-destructive",
  };
  const labels: Record<string, string> = {
    pendente: "Pendente",
    avaliado: "Avaliado",
    aprovado: "Aprovado",
    reprovado: "Reprovado",
  };
  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold " +
        (map[status] ?? "")
      }
    >
      {labels[status] ?? status}
    </span>
  );
}
