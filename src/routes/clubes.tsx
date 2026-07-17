import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MessageSquarePlus,
  Phone,
  Search,
  Unlock,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRECO_CONTATO_BRL } from "@/lib/mock-data";
import { calcularIdade } from "@/lib/date";
import { unlockContato, useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/clubes")({
  head: () => ({
    meta: [
      { title: "Clubes — Atletas aprovados — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Acesse a lista de atletas aprovados nas peneiras Pelé Next Gen e desbloqueie contatos.",
      },
    ],
  }),
  component: ClubesPage,
});

interface AtletaAprovado {
  candidatoId: string;
  userId: string | null;
  nome: string;
  posicao: string;
  cidade: string;
  dataNascimento: string;
  avatar: string | null;
  email: string;
  celular: string;
  notaGeral: number | null;
  peneiraTitulo: string | null;
  skills: Record<string, number>;
  skillsValidated: Record<string, number> | null;
  isValidated: boolean;
}

const SKILL_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Qualquer habilidade" },
  { key: "marcacao", label: "Marcação" },
  { key: "forca", label: "Força" },
  { key: "passe", label: "Passe" },
  { key: "velocidade", label: "Velocidade" },
  { key: "posicionamento", label: "Posicionamento" },
];

const POSICAO_OPTIONS = ["", "Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

function ClubesPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<AtletaAprovado | null>(null);
  const [aprovados, setAprovados] = useState<AtletaAprovado[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const canListAprovados =
    ready && !!user && (user.role === "clube" || user.role === "admin" || user.role === "suporte");

  useEffect(() => {
    if (!ready) return;
    if (!canListAprovados) {
      setAprovados([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("list_atletas_aprovados");
      if (cancelled) return;

      if (error) {
        toast.error("Erro ao carregar atletas aprovados", {
          description: error.message,
        });
        setAprovados([]);
        setLoading(false);
        return;
      }

      const baseList: AtletaAprovado[] = (data ?? []).map((r) => ({
        candidatoId: r.candidato_id as string,
        userId: r.user_id as string | null,
        nome: r.nome as string,
        posicao: (r.posicao ?? "Meia") as string,
        cidade: (r.cidade ?? "—") as string,
        dataNascimento: (r.data_nascimento as string) ?? "2000-01-01",
        avatar: (r.avatar_url as string | null) ?? null,
        email: "",
        celular: "",
        notaGeral: r.nota_geral != null ? Number(r.nota_geral) : null,
        peneiraTitulo: (r.peneira_titulo as string | null) ?? null,
      }));

      const unlockedIds = new Set(user?.contatosDesbloqueados ?? []);
      const toFetchUserIds = baseList
        .filter((a) => a.userId && unlockedIds.has(a.candidatoId))
        .map((a) => a.userId as string);

      if (toFetchUserIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, email, celular")
          .in("id", toFetchUserIds);
        if (cancelled) return;
        const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
        for (const a of baseList) {
          if (a.userId && unlockedIds.has(a.candidatoId)) {
            const p = profMap.get(a.userId);
            if (p) {
              a.email = p.email ?? "";
              a.celular = p.celular ?? "";
            }
          }
        }
      }

      const merged = baseList.sort(
        (a, b) => (b.notaGeral ?? -1) - (a.notaGeral ?? -1),
      );

      if (!cancelled) {
        setAprovados(merged);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, canListAprovados, user?.id, user?.contatosDesbloqueados?.length]);

  const list = useMemo(() => {
    if (!q.trim()) return aprovados;
    const t = q.toLowerCase();
    return aprovados.filter(
      (c) =>
        c.nome.toLowerCase().includes(t) ||
        c.posicao.toLowerCase().includes(t) ||
        c.cidade.toLowerCase().includes(t),
    );
  }, [q, aprovados]);

  const desbloqueados = new Set(user?.contatosDesbloqueados ?? []);

  if (ready && !canListAprovados) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-3 font-display text-2xl font-bold">Área exclusiva para clubes</h2>
          <p className="mt-2 text-muted-foreground">
            Faça login como clube para acessar atletas aprovados.
          </p>
          <Button asChild className="mt-4">
            <Link to="/login">Ir para login</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  async function confirmarPagamento() {
    if (!target) return;
    await unlockContato(target.candidatoId);
    setAprovados((prev) => [...prev]);
    toast.success("Pagamento confirmado!", {
      description: `Contato de ${target.nome} desbloqueado.`,
    });
    setTarget(null);
  }

  async function handleEnviarMensagem(c: AtletaAprovado) {
    if (!c.userId) return;
    setStartingChat(c.candidatoId);
    try {
      await startConversation(c.userId);
      navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao iniciar conversa");
    } finally {
      setStartingChat(null);
    }
  }

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Área do clube
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Atletas aprovados
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Veja todos os atletas aprovados pelos olheiros. Para visualizar e-mail e celular,
          libere o contato pagando{" "}
          <strong className="text-primary">
            R$ {PRECO_CONTATO_BRL.toFixed(2).replace(".", ",")}
          </strong>{" "}
          por atleta.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, posição ou cidade..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg2 px-3 py-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" />
          {desbloqueados.size} de {aprovados.length} contatos liberados
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-lg font-bold">Nenhum atleta aprovado por enquanto</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assim que os olheiros aprovarem atletas em peneiras, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const liberado = desbloqueados.has(c.candidatoId);
            return (
              <article
                key={c.candidatoId}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <AthleteAvatar
                      src={c.avatar}
                      alt={c.nome}
                      className="h-14 w-14 border-2 border-primary"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
                      {c.notaGeral?.toFixed(1) ?? "—"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {c.userId ? (
                      <Link
                        to="/atletas/$atletaId"
                        params={{ atletaId: c.userId }}
                        className="truncate font-display font-bold hover:text-primary"
                      >
                        {c.nome}
                      </Link>
                    ) : (
                      <h3 className="truncate font-display font-bold">{c.nome}</h3>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {c.posicao} · {calcularIdade(c.dataNascimento)} anos · {c.cidade}
                    </p>
                    <span className="mt-1.5 inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                      Aprovado
                    </span>
                  </div>
                </div>

                {c.peneiraTitulo && (
                  <p className="mt-3 truncate text-xs text-muted-foreground">
                    Aprovado em: <span className="text-foreground">{c.peneiraTitulo}</span>
                  </p>
                )}

                <div className="mt-4 space-y-2 rounded-xl border border-border bg-bg2 p-3">
                  <ContatoRow
                    icon={Mail}
                    label="E-mail"
                    value={c.email}
                    liberado={liberado}
                  />
                  <ContatoRow
                    icon={Phone}
                    label="Celular"
                    value={c.celular}
                    liberado={liberado}
                  />
                </div>

                {liberado ? (
                  <div className="mt-4 grid gap-2">
                    <Button variant="outline" disabled>
                      <Unlock className="mr-2 h-4 w-4 text-success" />
                      Contato liberado
                    </Button>
                    <Button
                      onClick={() => handleEnviarMensagem(c)}
                      disabled={!c.userId || startingChat === c.candidatoId}
                    >
                      {startingChat === c.candidatoId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                      )}
                      Enviar mensagem
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setTarget(c)} className="mt-4 w-full">
                    <Lock className="mr-2 h-4 w-4" />
                    Liberar contato — R${" "}
                    {PRECO_CONTATO_BRL.toFixed(2).replace(".", ",")}
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liberar contato do atleta</DialogTitle>
            <DialogDescription>
              Você está liberando os dados de contato (e-mail e celular) de{" "}
              <strong className="text-foreground">{target?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Valor
            </p>
            <p className="font-display text-3xl font-extrabold text-gradient-gold">
              R$ {PRECO_CONTATO_BRL.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pagamento único por atleta. Acesso permanente após confirmação. Após liberar,
              você também poderá enviar mensagens diretamente para o atleta.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            * Esta é uma simulação acadêmica. Nenhum pagamento real será efetuado.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarPagamento}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function ContatoRow({
  icon: Icon,
  label,
  value,
  liberado,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  liberado: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}:
      </span>
      <span
        className={
          "truncate font-semibold " +
          (liberado ? "text-foreground" : "select-none text-muted-foreground blur-sm")
        }
      >
        {liberado ? value || "—" : "•••••• oculto ••••••"}
      </span>
    </div>
  );
}
