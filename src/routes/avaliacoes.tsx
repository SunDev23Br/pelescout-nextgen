import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Save, Trophy } from "lucide-react";
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
import { candidatos, peneiras } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações — Pelé Next Gen" },
      { name: "description", content: "Avalie atletas em tempo real durante as peneiras." },
    ],
  }),
  component: AvaliacoesPage,
});

function AvaliacoesPage() {
  const [peneiraId, setPeneiraId] = useState(peneiras[0].id);
  const lista = useMemo(
    () => candidatos.filter((c) => c.peneiraId === peneiraId),
    [peneiraId],
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

  function salvar() {
    if (!selected) return;
    toast.success(`Avaliação salva para ${selected.nome}!`, {
      description: `Nota geral: ${((tecnica + fisico + tatico + psicologico) / 4).toFixed(1)}`,
    });
    setComentario("");
  }

  const radarData = [
    { criterio: "Técnica", nota: tecnica },
    { criterio: "Físico", nota: fisico },
    { criterio: "Tático", nota: tatico },
    { criterio: "Psicológico", nota: psicologico },
  ];
  const media = (tecnica + fisico + tatico + psicologico) / 4;

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Avaliações
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Avalie em tempo real
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione o atleta e atribua notas durante a peneira.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Peneira
          </p>
          <Select
            value={peneiraId}
            onValueChange={(v) => {
              setPeneiraId(v);
              const first = candidatos.find((c) => c.peneiraId === v);
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
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Lista de atletas */}
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Atletas ({lista.length})
          </p>
          <div className="max-h-[600px] space-y-1 overflow-y-auto">
            {lista.map((c) => {
              const active = selected?.id === c.id;
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
                  {c.status === "avaliado" || c.status === "aprovado" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Painel de avaliação */}
        {selected && (
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
                placeholder="Observações sobre o desempenho do atleta..."
                className="mt-3"
                maxLength={500}
              />
              <div className="mt-1 text-right text-[11px] text-muted-foreground">
                {comentario.length}/500
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" size="lg">
                <Trophy className="mr-2 h-5 w-5" />
                Marcar como aprovado
              </Button>
              <Button onClick={salvar} size="lg">
                <Save className="mr-2 h-5 w-5" />
                Salvar avaliação
              </Button>
            </div>
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
