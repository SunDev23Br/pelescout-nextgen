import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Lock, Mail, MapPin, Phone, Search, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { candidatos, type Candidato } from "@/lib/mock-data";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

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

const PRECO_DESBLOQUEIO = 49.99;

function CandidatosPage() {
  const { user, ready } = useSession();
  if (ready && user?.role === "clube") {
    return <Navigate to="/clubes" />;
  }
  const isClube = false;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]["value"]>("todos");
  const effectiveStatus = status;

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
          {isClube ? "Atletas aprovados" : "Atletas inscritos"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isClube
            ? "Desbloqueie o local e o contato dos atletas para iniciar a negociação."
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
            aria-label="Buscar atletas"
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

      {isClube ? (
        <ClubeCardsView list={list} />
      ) : (
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
                <tr key={c.id} className="border-t border-border transition-colors hover:bg-bg2">
                  <td className="px-5 py-3">
                    <Link
                      to="/candidatos/$candidatoId"
                      params={{ candidatoId: c.id }}
                      className="flex items-center gap-3 font-semibold hover:text-primary"
                    >
                      <AthleteAvatar src={c.avatar} alt={c.nome} className="h-9 w-9 border border-border" />
                      {c.nome}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.posicao}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{c.idade} anos</td>
                  <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{c.cidade}</td>
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
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    Nenhum candidato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

function ClubeCardsView({ list }: { list: Candidato[] }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [paying, setPaying] = useState<Candidato | null>(null);
  const [processing, setProcessing] = useState(false);

  const confirmar = async () => {
    if (!paying) return;
    setProcessing(true);
    // Simula processamento de pagamento
    await new Promise((r) => setTimeout(r, 900));
    setUnlocked((prev) => {
      const next = new Set(prev);
      next.add(paying.id);
      return next;
    });
    setProcessing(false);
    toast.success(`Contato de ${paying.nome} desbloqueado!`);
    setPaying(null);
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-card">
        Nenhum atleta aprovado encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const isUnlocked = unlocked.has(c.id);
          return (
            <article
              key={c.id}
              className="group flex flex-col gap-4 rounded-2xl border-2 border-border bg-card p-5 shadow-card transition-all focus-within:ring-2 focus-within:ring-primary hover:border-primary/40"
              aria-label={`Atleta ${c.nome}`}
            >
              <header className="flex items-start gap-4">
                <AthleteAvatar
                  src={c.avatar}
                  alt={c.nome}
                  className="h-14 w-14 shrink-0 border-2 border-primary/30"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg font-extrabold leading-tight">
                    {c.nome}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {c.posicao} · {c.idade} anos · {c.altura}cm
                  </p>
                  <Badge className="mt-1 bg-success/15 text-success hover:bg-success/15">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Aprovado
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Nota
                  </p>
                  <p className="font-display text-2xl font-extrabold text-gradient-gold">
                    {c.notaGeral?.toFixed(1) ?? "—"}
                  </p>
                </div>
              </header>

              <dl className="space-y-2 rounded-xl bg-bg2 p-4 text-sm">
                <InfoRow
                  icon={MapPin}
                  label="Local"
                  value={c.cidade}
                  hidden={!isUnlocked}
                />
                <InfoRow
                  icon={Phone}
                  label="Telefone"
                  value={c.celular}
                  hidden={!isUnlocked}
                />
                <InfoRow
                  icon={Mail}
                  label="E-mail"
                  value={c.email}
                  hidden={!isUnlocked}
                />
              </dl>

              {isUnlocked ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Contato desbloqueado
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setPaying(c)}
                  className="h-12 w-full text-base font-bold"
                  aria-label={`Desbloquear contato de ${c.nome} por R$ 49,99`}
                >
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Desbloquear por R$ 49,99
                </Button>
              )}
            </article>
          );
        })}
      </div>

      <Dialog open={!!paying} onOpenChange={(o) => !o && !processing && setPaying(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Confirmar desbloqueio</DialogTitle>
            <DialogDescription>
              Você terá acesso ao local e aos contatos (telefone e e-mail) de{" "}
              <strong className="text-foreground">{paying?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border bg-bg2 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold text-gradient-gold">
              R$ {PRECO_DESBLOQUEIO.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Pagamento único, acesso imediato
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setPaying(null)}
              disabled={processing}
              className="h-11"
            >
              Cancelar
            </Button>
            <Button onClick={confirmar} disabled={processing} className="h-11 font-bold">
              {processing ? "Processando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  hidden,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  hidden: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden={true} />
      <dt className="sr-only">{label}</dt>
      <dd className="flex-1 truncate font-medium">
        {hidden ? (
          <span className="select-none blur-sm" aria-label={`${label} bloqueado`}>
            ••••••••••••
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
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
