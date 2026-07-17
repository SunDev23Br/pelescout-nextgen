import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, X, ShieldCheck, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SKILL_KEYS = [
  { key: "marcacao", label: "Marcação" },
  { key: "forca", label: "Força" },
  { key: "passe", label: "Passe" },
  { key: "velocidade", label: "Velocidade" },
  { key: "posicionamento", label: "Posicionamento" },
];

interface Atleta {
  id: string;
  nome: string;
  avatar_url: string | null;
  posicao: string | null;
  cidade: string | null;
  data_nascimento: string | null;
  altura: number | null;
  peso: number | null;
  pe: string | null;
  skills: Record<string, unknown> | null;
  skills_validated: Record<string, unknown> | null;
  is_validated: boolean;
}

function idade(dn: string | null) {
  if (!dn) return "—";
  const d = new Date(dn);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function effSkill(a: Atleta, key: string): number | null {
  const src = (a.skills_validated && Object.keys(a.skills_validated).length > 0)
    ? a.skills_validated
    : a.skills;
  if (!src) return null;
  const v = (src as Record<string, unknown>)[key];
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const Route = createFileRoute("/comparador")({
  head: () => ({
    meta: [
      { title: "Comparador de atletas — PeleScout" },
      { name: "description", content: "Compare até 3 atletas lado a lado por skills, dados físicos e histórico." },
    ],
  }),
  component: ComparadorPage,
});

function ComparadorPage() {
  const [candidates, setCandidates] = useState<Array<{ id: string; nome: string; posicao: string | null; avatar_url: string | null }>>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("search_public_atletas", { _limit: 200 });
      setCandidates((data ?? []).map((a) => ({
        id: a.id, nome: a.nome, posicao: a.posicao, avatar_url: a.avatar_url,
      })));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedIds.length === 0) { setAtletas([]); return; }
      setLoading(true);
      const { data } = await supabase.rpc("compare_atletas", { _ids: selectedIds });
      setAtletas((data ?? []) as unknown as Atleta[]);
      setLoading(false);
    })();
  }, [selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates
      .filter((c) => !selectedIds.includes(c.id))
      .filter((c) => !q || c.nome.toLowerCase().includes(q))
      .slice(0, 8);
  }, [candidates, search, selectedIds]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setSearch("");
  };

  const bestOf = (key: string) => {
    const values = atletas.map((a) => effSkill(a, key)).filter((v): v is number => v !== null);
    return values.length ? Math.max(...values) : null;
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Users className="h-7 w-7 text-primary" />
            Comparador de atletas
          </h1>
          <p className="text-sm text-muted-foreground">Selecione até 3 atletas para comparar habilidades e dados lado a lado.</p>
        </header>

        <div className="rounded-2xl border border-border bg-bg2 p-4">
          <label className="mb-2 block text-xs font-semibold text-muted-foreground">Buscar atleta</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite o nome…"
            className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
          />
          {search && filtered.length > 0 && (
            <ul className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-bg3">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => toggle(c.id)}
                    disabled={selectedIds.length >= 3}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-sidebar-accent disabled:opacity-40"
                  >
                    <AthleteAvatar src={c.avatar_url ?? undefined} alt={c.nome} className="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.posicao ?? "—"}</p>
                    </div>
                    <Plus className="h-4 w-4 text-primary" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading && <p className="text-center text-sm text-muted-foreground">Carregando comparação…</p>}

        {atletas.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Nenhum atleta selecionado ainda. Adicione até 3 pelo buscador acima.
          </div>
        )}

        {atletas.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-bg2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-xs font-semibold uppercase text-muted-foreground">Atleta</th>
                  {atletas.map((a) => (
                    <th key={a.id} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <AthleteAvatar src={a.avatar_url ?? undefined} alt={a.nome} className="h-14 w-14 border border-border" />
                          <button
                            onClick={() => toggle(a.id)}
                            aria-label="Remover"
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <Link to="/a/$atletaId" params={{ atletaId: a.id }} className="text-sm font-semibold hover:text-primary">
                          {a.nome}
                        </Link>
                        {a.is_validated && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Posição", get: (a: Atleta) => a.posicao ?? "—" },
                  { label: "Cidade", get: (a: Atleta) => a.cidade ?? "—" },
                  { label: "Idade", get: (a: Atleta) => idade(a.data_nascimento) },
                  { label: "Altura", get: (a: Atleta) => a.altura ? `${a.altura} cm` : "—" },
                  { label: "Peso", get: (a: Atleta) => a.peso ? `${a.peso} kg` : "—" },
                  { label: "Pé", get: (a: Atleta) => a.pe ?? "—" },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                    {atletas.map((a) => (
                      <td key={a.id} className="p-3 text-center">{row.get(a)}</td>
                    ))}
                  </tr>
                ))}
                {SKILL_KEYS.map((s) => {
                  const best = bestOf(s.key);
                  return (
                    <tr key={s.key} className="border-b border-border">
                      <td className="p-3 font-medium">{s.label}</td>
                      {atletas.map((a) => {
                        const v = effSkill(a, s.key);
                        const isBest = v !== null && best !== null && v === best && atletas.length > 1;
                        return (
                          <td key={a.id} className="p-3 text-center">
                            {v === null ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className={`inline-block rounded-lg px-3 py-1 font-bold ${isBest ? "bg-primary text-primary-foreground" : "bg-bg3"}`}>
                                {v}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {atletas.length > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedIds([])}>Limpar comparação</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
