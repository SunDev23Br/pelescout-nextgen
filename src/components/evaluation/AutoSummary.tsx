import { useMemo } from "react";

interface AutoSummaryProps {
  scores: {
    tecnica: number;
    tatica: number;
    fisica: number;
    mental: number;
    intensidade: number;
  };
  positiveTags: string[];
  negativeTags: string[];
}

export function AutoSummary({ scores, positiveTags, negativeTags }: AutoSummaryProps) {
  const summary = useMemo(() => {
    const avg = (scores.tecnica + scores.tatica + scores.fisica + scores.mental + scores.intensidade) / 5;
    if (avg === 0) return "Selecione as notas para gerar o parecer automático.";

    const parts: string[] = [];

    // Overall assessment
    if (avg >= 4) parts.push("Atleta de alto nível com desempenho consistente.");
    else if (avg >= 3) parts.push("Atleta com bom potencial e desempenho regular.");
    else if (avg >= 2) parts.push("Atleta em desenvolvimento, necessita evolução.");
    else parts.push("Atleta abaixo do nível esperado.");

    // Highlights from scores
    const highlights: string[] = [];
    if (scores.tecnica >= 4) highlights.push("qualidade técnica");
    if (scores.tatica >= 4) highlights.push("boa leitura de jogo");
    if (scores.fisica >= 4) highlights.push("excelente preparo físico");
    if (scores.mental >= 4) highlights.push("forte mentalidade");
    if (scores.intensidade >= 4) highlights.push("alta intensidade");
    if (highlights.length > 0) parts.push(`Destaca-se por ${highlights.join(", ")}.`);

    // Positive tags
    if (positiveTags.length > 0) {
      parts.push(`Pontos fortes observados: ${positiveTags.slice(0, 3).join(", ")}.`);
    }

    // Weaknesses from scores
    const weaknesses: string[] = [];
    if (scores.tecnica <= 2) weaknesses.push("parte técnica");
    if (scores.tatica <= 2) weaknesses.push("leitura tática");
    if (scores.fisica <= 2) weaknesses.push("condicionamento físico");
    if (scores.mental <= 2) weaknesses.push("aspecto mental");
    if (scores.intensidade <= 2) weaknesses.push("intensidade");
    if (weaknesses.length > 0) parts.push(`Precisa evoluir em ${weaknesses.join(", ")}.`);

    // Negative tags
    if (negativeTags.length > 0) {
      parts.push(`Atenção: ${negativeTags.slice(0, 3).join(", ").toLowerCase()}.`);
    }

    return parts.join(" ");
  }, [scores, positiveTags, negativeTags]);

  const avg = (scores.tecnica + scores.tatica + scores.fisica + scores.mental + scores.intensidade) / 5;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-bold mb-2">Parecer Automático</h3>
      <p className={`text-xs leading-relaxed ${avg === 0 ? "text-muted-foreground italic" : "text-foreground/90"}`}>
        {summary}
      </p>
    </div>
  );
}
