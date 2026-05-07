import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Ruler, Weight, Footprints, Mail, Phone } from "lucide-react";
import { useSession } from "@/lib/session";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { getCandidato, getPeneira } from "@/lib/mock-data";

export const Route = createFileRoute("/candidatos/$candidatoId")({
  loader: ({ params }) => {
    const candidato = getCandidato(params.candidatoId);
    if (!candidato) throw notFound();
    const peneira = getPeneira(candidato.peneiraId);
    return { candidato, peneira };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.candidato.nome ?? "Atleta"} — Pelé Next Gen` },
      {
        name: "description",
        content: `Perfil e avaliação de ${loaderData?.candidato.nome ?? "atleta"}.`,
      },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout>
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Atleta não encontrado</h2>
        <Button asChild className="mt-4">
          <Link to="/candidatos">Voltar</Link>
        </Button>
      </div>
    </AppLayout>
  ),
  component: CandidatoDetalhe,
});

function CandidatoDetalhe() {
  const { candidato, peneira } = Route.useLoaderData();
  const { user } = useSession();
  const isClube = user?.role === "clube";
  const liberado =
    !isClube || (user?.contatosDesbloqueados ?? []).includes(candidato.id);

  const radarData = candidato.avaliacao
    ? [
        { criterio: "Técnica", nota: candidato.avaliacao.tecnica },
        { criterio: "Físico", nota: candidato.avaliacao.fisico },
        { criterio: "Tático", nota: candidato.avaliacao.tatico },
        { criterio: "Psicológico", nota: candidato.avaliacao.psicologico },
      ]
    : [];

  return (
    <AppLayout>
      <Link
        to="/candidatos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para candidatos
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <AthleteAvatar
                src={candidato.avatar}
                alt={candidato.nome}
                className="h-28 w-28 border-4 border-primary shadow-gold"
              />
              <span className="absolute -bottom-1 right-0 rounded-full bg-gradient-gold px-2 py-0.5 text-xs font-bold text-primary-foreground shadow">
                {candidato.notaGeral?.toFixed(1) ?? "—"}
              </span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold">{candidato.nome}</h1>
            <p className="text-sm text-muted-foreground">
              {candidato.posicao} · {candidato.idade} anos
            </p>

            <div className="mt-6 grid w-full grid-cols-3 gap-2">
              <Stat icon={Ruler} label="Altura" value={`${candidato.altura}cm`} />
              <Stat icon={Weight} label="Peso" value={`${candidato.peso}kg`} />
              <Stat icon={Footprints} label="Pé" value={candidato.pe} />
            </div>

            <div className="mt-6 w-full rounded-xl border border-border bg-bg2 p-4 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Cidade
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> {candidato.cidade}
              </p>
            </div>

            <div className="mt-4 w-full rounded-xl border border-border bg-bg2 p-4 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contato
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span
                  className={
                    "font-semibold " +
                    (liberado ? "" : "select-none blur-sm text-muted-foreground")
                  }
                >
                  {liberado ? candidato.email : "•••••••• oculto"}
                </span>
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span
                  className={
                    "font-semibold " +
                    (liberado ? "" : "select-none blur-sm text-muted-foreground")
                  }
                >
                  {liberado ? candidato.celular : "•••••••• oculto"}
                </span>
              </p>
              {!liberado && (
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link to="/clubes">Liberar contato</Link>
                </Button>
              )}
            </div>

            {peneira && (
              <Link
                to="/peneiras/$peneiraId"
                params={{ peneiraId: peneira.id }}
                className="mt-4 w-full rounded-xl border border-primary/30 bg-primary/10 p-4 text-left text-sm transition-colors hover:bg-primary/15"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Peneira inscrita
                </p>
                <p className="mt-1 font-semibold">{peneira.titulo}</p>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold">Desempenho</h2>
            <p className="text-sm text-muted-foreground">
              Avaliação técnica multidimensional do atleta
            </p>

            {candidato.avaliacao ? (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="criterio"
                      tick={{ fill: "#e8ecf2", fontSize: 13, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 5]}
                      tick={{ fill: "#8a9bb5", fontSize: 11 }}
                    />
                    <Radar
                      name="Notas"
                      dataKey="nota"
                      stroke="#d4af37"
                      fill="#d4af37"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {radarData.map((d) => (
                    <div
                      key={d.criterio}
                      className="rounded-xl border border-border bg-bg2 p-3 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {d.criterio}
                      </p>
                      <p className="mt-1 font-display text-2xl font-extrabold text-gradient-gold">
                        {d.nota.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-bg2 p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Este atleta ainda não foi avaliado.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/avaliacoes">Avaliar agora</Link>
                </Button>
              </div>
            )}
          </div>

          {candidato.comentario && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Comentário do olheiro</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                "{candidato.comentario}"
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg2 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
