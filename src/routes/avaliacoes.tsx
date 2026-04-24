import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Mail, Save, ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCandidatosDoJogo, peneiras } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações ao vivo — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Avalie atletas em tempo real, jogo a jogo, durante a peneira em andamento.",
      },
    ],
  }),
  component: AvaliacoesPage,
});

function AvaliacoesPage() {
  const [peneiraId, setPeneiraId] = useState(peneiras[0].id);
  const peneiraSel = useMemo(
    () => peneiras.find((p) => p.id === peneiraId)!,
    [peneiraId],
  );
  const [jogoNumero, setJogoNumero] = useState<number>(peneiraSel.jogos[0]?.numero ?? 1);

  const lista = useMemo(
    () => getCandidatosDoJogo(peneiraId, jogoNumero),
    [peneiraId, jogoNumero],
  );
  const [selectedId, setSelectedId] = useState(lista[0]?.id ?? "");
  const selected = useMemo(
    () => lista.find((c) => c.id === selectedId) ?? lista[0],
    [lista, selectedId],
  );

  const [tecnica, setTecnica] = useState(7);
  const [fisico, setFisico] = useState(7);
  const [tatico, setTatico] = useState(7);
  const [psicologico, setPsicologico] = useState(7);
  const [comentario, setComentario] = useState("");

  // Decisões locais por candidato (somente para esta sessão de mock)
  const [decisoes, setDecisoes] = useState<Record<string, "aprovado" | "reprovado">>({});

  function salvar() {
    if (!selected) return;
    toast.success(`Avaliação salva para ${selected.nome}`, {
      description: `Nota geral: ${((tecnica + fisico + tatico + psicologico) / 4).toFixed(1)}`,
    });
    setComentario("");
  }

  function decidir(decisao: "aprovado" | "reprovado") {
    if (!selected) return;
    setDecisoes((d) => ({ ...d, [selected.id]: decisao }));
    const isAprov = decisao === "aprovado";
    toast.success(isAprov ? "Atleta aprovado!" : "Atleta desaprovado.", {
      description: `Decisão registrada para ${selected.nome}.`,
    });
    // Sugere envio de feedback automaticamente
    setTimeout(() => enviarFeedback(decisao, true), 300);
  }

  function enviarFeedback(
    decisao?: "aprovado" | "reprovado",
    silenciar = false,
  ) {
    if (!selected) return;
    const final = decisao ?? decisoes[selected.id];
    if (!final) {
      if (!silenciar)
        toast.error("Defina aprovado ou desaprovado antes de enviar o feedback.");
      return;
    }
    toast.success(
      `📧 E-mail enviado para ${selected.email}`,
      {
        description: `Status: ${final === "aprovado" ? "Aprovado" : "Não aprovado"} — feedback do olheiro incluso.`,
      },
    );
  }

  const radarData = [
    { criterio: "Técnica", nota: tecnica },
    { criterio: "Físico", nota: fisico },
    { criterio: "Tático", nota: tatico },
    { criterio: "Psicológico", nota: psicologico },
  ];
  const media = (tecnica + fisico + tatico + psicologico) / 4;
  const decisaoSel = selected ? decisoes[selected.id] : undefined;

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Avaliação ao vivo
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Acompanhe e avalie jogo a jogo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione a peneira e o jogo em andamento. Apenas atletas daquele jogo aparecem na
          lista — atribua notas e decida em tempo real.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Peneira
          </p>
          <Select
            value={peneiraId}
            onValueChange={(v) => {
              setPeneiraId(v);
              const p = peneiras.find((x) => x.id === v)!;
              setJogoNumero(p.jogos[0]?.numero ?? 1);
              const first = getCandidatosDoJogo(v, p.jogos[0]?.numero ?? 1)[0];
              if (first) setSelectedId(first.id);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {peneiras.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Jogo em andamento
          </p>
          <Select
            value={String(jogoNumero)}
            onValueChange={(v) => {
              const n = Number(v);
              setJogoNumero(n);
              const first = getCandidatosDoJogo(peneiraId, n)[0];
              if (first) setSelectedId(first.id);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {peneiraSel.jogos.map((j) => (
                <SelectItem key={j.numero} value={String(j.numero)}>
                  Jogo {j.numero} — {j.horario}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Lista de atletas do jogo */}
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Atletas no jogo {jogoNumero} ({lista.length})
          </p>
          <div className="max-h-[600px] space-y-1 overflow-y-auto">
            {lista.map((c) => {
              const active = selected?.id === c.id;
              const dec = decisoes[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={
                    "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors " +
                    (active ? "bg-primary/15 text-foreground" : "hover:bg-bg2")
                  }
                >
                  <img
                    src={c.avatar}
                    alt={c.nome}
                    className="h-9 w-9 rounded-full border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.posicao} · {c.idade}a
                    </p>
                  </div>
                  {dec === "aprovado" && (
                    <ThumbsUp className="h-4 w-4 text-success" />
                  )}
                  {dec === "reprovado" && (
                    <ThumbsDown className="h-4 w-4 text-destructive" />
                  )}
                  {!dec && (c.status === "avaliado" || c.status === "aprovado") && (
                    <CheckCircle2 className="h-4 w-4 text-success/60" />
                  )}
                </button>
              );
            })}
            {lista.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                Nenhum atleta neste jogo.
              </p>
            )}
          </div>
        </aside>

        {/* Painel de avaliação */}
        {selected ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={selected.avatar}
                  alt={selected.nome}
                  className="h-16 w-16 rounded-full border-2 border-primary object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-display text-xl font-extrabold">{selected.nome}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.posicao} · {selected.idade} anos · {selected.cidade}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {selected.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Nota geral
                  </p>
                  <p className="font-display text-3xl font-extrabold text-gradient-gold">
                    {media.toFixed(1)}
                  </p>
                </div>
              </div>
              {decisaoSel && (
                <div
                  className={
                    "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider " +
                    (decisaoSel === "aprovado"
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive")
                  }
                >
                  {decisaoSel === "aprovado" ? (
                    <ThumbsUp className="h-3.5 w-3.5" />
                  ) : (
                    <ThumbsDown className="h-3.5 w-3.5" />
                  )}
                  {decisaoSel === "aprovado" ? "Aprovado" : "Desaprovado"}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-base font-bold">Critérios</h3>
                <p className="text-xs text-muted-foreground">Notas de 0 a 10</p>

                <div className="mt-5 space-y-5">
                  <Criterio label="Técnica" value={tecnica} onChange={setTecnica} />
                  <Criterio label="Físico" value={fisico} onChange={setFisico} />
                  <Criterio label="Tático" value={tatico} onChange={setTatico} />
                  <Criterio
                    label="Psicológico"
                    value={psicologico}
                    onChange={setPsicologico}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-base font-bold">Pré-visualização</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="criterio"
                      tick={{ fill: "#e8ecf2", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 10]}
                      tick={{ fill: "#8a9bb5", fontSize: 10 }}
                    />
                    <Radar
                      dataKey="nota"
                      stroke="#d4af37"
                      fill="#d4af37"
                      fillOpacity={0.45}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-base font-bold">Comentário do olheiro</h3>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                placeholder="Observações sobre o desempenho do atleta — incluído no e-mail de feedback."
                className="mt-3"
                maxLength={500}
              />
              <div className="mt-1 text-right text-[11px] text-muted-foreground">
                {comentario.length}/500
              </div>
            </div>

            {/* Decisão + e-mail */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-base font-bold">Decisão final</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ao decidir, um feedback é enviado por e-mail ao atleta.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => decidir("aprovado")}
                  size="lg"
                  className="bg-success text-primary-foreground hover:bg-success/90"
                >
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  Aprovar
                </Button>
                <Button
                  onClick={() => decidir("reprovado")}
                  size="lg"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <ThumbsDown className="mr-2 h-5 w-5" />
                  Desaprovar
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => enviarFeedback()}
                className="mt-3 w-full"
                disabled={!decisaoSel}
              >
                <Mail className="mr-2 h-4 w-4" />
                Reenviar feedback por e-mail
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" size="lg" onClick={salvar}>
                <Save className="mr-2 h-5 w-5" />
                Salvar avaliação
              </Button>
              <Button size="lg" onClick={() => decidir("aprovado")}>
                <Trophy className="mr-2 h-5 w-5" />
                Salvar e aprovar
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum atleta participando deste jogo.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Criterio({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
          {value.toFixed(1)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={0}
        max={10}
        step={0.1}
      />
    </div>
  );
}
