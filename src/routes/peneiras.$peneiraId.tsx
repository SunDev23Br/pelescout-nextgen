import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Globe2,
  ListChecks,
  Lock,
  MapPin,
  ShieldCheck,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { getPeneira } from "@/lib/mock-data";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/peneiras/$peneiraId")({
  loader: ({ params }) => {
    const peneira = getPeneira(params.peneiraId);
    if (!peneira) throw notFound();
    return { peneira };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.peneira.titulo ?? "Peneira"} — Pelé Next Gen` },
      {
        name: "description",
        content:
          loaderData?.peneira.descricao ??
          "Detalhes da peneira oficial Pelé Next Gen.",
      },
      ...(loaderData?.peneira.imagem
        ? [{ property: "og:image", content: loaderData.peneira.imagem }]
        : []),
    ],
  }),
  notFoundComponent: () => (
    <AppLayout>
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Peneira não encontrada</h2>
        <Button asChild className="mt-4">
          <Link to="/peneiras">Voltar para peneiras</Link>
        </Button>
      </div>
    </AppLayout>
  ),
  component: PeneiraDetalhe,
});

function PeneiraDetalhe() {
  const { peneira } = Route.useLoaderData();
  const { user } = useSession();
  const navigate = useNavigate();
  const [inscrito, setInscrito] = useState(false);

  const dataFmt = new Date(peneira.data + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const limiteFmt = peneira.limiteInscricao
    ? new Date(peneira.limiteInscricao).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const totalJogos = peneira.jogos.length;

  function inscrever() {
    if (!user) {
      toast.error("Faça login para se inscrever.");
      navigate({ to: "/login" });
      return;
    }
    if (peneira.visibilidade === "privada") {
      toast.error("Esta peneira é privada — apenas atletas convidados.");
      return;
    }
    setInscrito(true);
    toast.success("Inscrição confirmada! Boa sorte na peneira. ⚽");
  }

  return (
    <AppLayout>
      <Link
        to="/peneiras"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para peneiras
      </Link>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="relative h-64 sm:h-80">
          <img
            src={peneira.imagem}
            alt={peneira.titulo}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={peneira.status} />
              <VisibilidadeBadge visibilidade={peneira.visibilidade} />
              {peneira.categorias.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur"
                >
                  {c}
                </span>
              ))}
            </div>
            <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-4xl">
              {peneira.titulo}
            </h1>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold">Sobre a peneira</h2>
            <p className="mt-2 text-muted-foreground">{peneira.descricao}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info
                icon={Calendar}
                label="Data"
                value={dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1)}
              />
              <Info
                icon={Clock}
                label="Janela de jogos"
                value={`${peneira.horaInicio} – ${peneira.horaFim}`}
              />
              <Info
                icon={Timer}
                label="Duração / jogo"
                value={`${peneira.duracaoJogoMin} min`}
              />
              <Info
                icon={ListChecks}
                label="Jogos no dia"
                value={`${totalJogos} (${peneira.participantesPorJogo} atletas/jogo)`}
              />
              <Info
                icon={MapPin}
                label="Local"
                value={`${peneira.local} — ${peneira.cidade}/${peneira.estado}`}
              />
              <Info
                icon={Users}
                label="Vagas"
                value={`${peneira.inscritos}/${peneira.vagas} preenchidas`}
              />
              <Info icon={ShieldCheck} label="Organizador" value={peneira.organizador} />
              <Info
                icon={Trophy}
                label="Categorias"
                value={peneira.categorias.join(", ")}
              />
            </div>

            {/* Cronograma de jogos */}
            <div className="mt-8 rounded-2xl border border-border bg-bg2 p-5">
              <h3 className="flex items-center gap-2 font-display font-bold">
                <ListChecks className="h-5 w-5 text-primary" />
                Cronograma do dia
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalJogos} jogos × {peneira.participantesPorJogo} atletas ={" "}
                {peneira.vagas} vagas totais
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {peneira.jogos.slice(0, 12).map((j) => (
                  <div
                    key={j.numero}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span className="font-display font-bold">Jogo {j.numero}</span>
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                      {j.horario}
                    </span>
                  </div>
                ))}
                {peneira.jogos.length > 12 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                    +{peneira.jogos.length - 12} jogos
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <h3 className="flex items-center gap-2 font-display font-bold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                O que levar no dia
              </h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li>• Documento com foto</li>
                <li>• Chuteira e meião</li>
                <li>• Garrafa de água</li>
                <li>• Roupa esportiva</li>
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-bg2 p-6">
              {inscrito ? (
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="mt-3 font-display text-lg font-bold">Inscrição confirmada!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Você receberá os detalhes por e-mail. Chegue 30 minutos antes.
                  </p>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link to="/manual">Ler manual do atleta</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Inscrição
                  </p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-gradient-gold">
                    Gratuita
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Limite: <span className="font-semibold text-foreground">{limiteFmt}</span>
                  </p>

                  <Button
                    onClick={inscrever}
                    className="mt-5 w-full"
                    size="lg"
                    disabled={
                      peneira.status === "encerrada" ||
                      peneira.inscritos >= peneira.vagas ||
                      peneira.visibilidade === "privada"
                    }
                  >
                    {peneira.visibilidade === "privada"
                      ? "Peneira privada — só convidados"
                      : peneira.status === "encerrada"
                        ? "Peneira encerrada"
                        : peneira.inscritos >= peneira.vagas
                          ? "Vagas esgotadas"
                          : "Confirmar inscrição"}
                  </Button>

                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    Ao se inscrever você concorda com os termos da Pelé Next Gen.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

function VisibilidadeBadge({
  visibilidade,
}: {
  visibilidade: "publica" | "privada";
}) {
  if (visibilidade === "privada") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-dark/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
        <Lock className="h-3 w-3" /> Privada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success backdrop-blur">
      <Globe2 className="h-3 w-3" /> Pública
    </span>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-bg2 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
