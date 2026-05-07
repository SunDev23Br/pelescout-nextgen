import { useMemo } from "react";
import type { FootData } from "./FootProfile";

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
  foot?: FootData;
}

export function AutoSummary({ scores, positiveTags, negativeTags, foot }: AutoSummaryProps) {
  const summary = useMemo(() => {
    const avg = (scores.tecnica + scores.tatica + scores.fisica + scores.mental + scores.intensidade) / 5;
    if (avg === 0) return "Selecione as notas para gerar o parecer automático.";

    const parts: string[] = [];

    if (avg >= 4) parts.push("Atleta de alto nível com desempenho consistente.");
    else if (avg >= 3) parts.push("Atleta com bom potencial e desempenho regular.");
    else if (avg >= 2) parts.push("Atleta em desenvolvimento, necessita evolução.");
    else parts.push("Atleta abaixo do nível esperado.");

    const highlights: string[] = [];
    if (scores.tecnica >= 4) highlights.push("qualidade técnica");
    if (scores.tatica >= 4) highlights.push("boa leitura de jogo");
    if (scores.fisica >= 4) highlights.push("excelente preparo físico");
    if (scores.mental >= 4) highlights.push("forte mentalidade");
    if (scores.intensidade >= 4) highlights.push("alta intensidade");
    if (highlights.length > 0) parts.push(`Destaca-se por ${highlights.join(", ")}.`);

    if (positiveTags.length > 0) {
      parts.push(`Pontos fortes observados: ${positiveTags.slice(0, 3).join(", ")}.`);
    }

    // Foot / bilateral analysis
    if (foot && foot.dominante) {
      const bilateralAvg =
        (foot.bilateral.passe + foot.bilateral.finalizacao + foot.bilateral.dominio + foot.bilateral.drible) / 4;

      if (foot.dominante === "ambidestro") {
        parts.push("Atleta ambidestro, com excelente versatilidade nas duas pernas.");
      } else if (foot.usoNaoDominante >= 4 || bilateralAvg >= 4) {
        parts.push(
          `Apresenta boa utilização da perna não dominante (${foot.dominante === "direita" ? "esquerda" : "direita"}), conseguindo finalizar e passar com qualidade bilateral.`
        );
      } else if (foot.usoNaoDominante > 0 && foot.usoNaoDominante <= 2) {
        parts.push(`Mostra forte dependência da perna ${foot.dominante}, com pouca utilização da perna fraca.`);
      } else if (foot.usoNaoDominante === 3) {
        parts.push("Uso razoável da perna não dominante, com espaço para evolução bilateral.");
      }

      if (foot.positiveTags.length > 0) {
        parts.push(`Bilateralidade: ${foot.positiveTags.join(", ").toLowerCase()}.`);
      }
      if (foot.negativeTags.length > 0) {
        parts.push(`Limitações: ${foot.negativeTags.join(", ").toLowerCase()}.`);
      }
    }

    const weaknesses: string[] = [];
    if (scores.tecnica <= 2 && scores.tecnica > 0) weaknesses.push("parte técnica");
    if (scores.tatica <= 2 && scores.tatica > 0) weaknesses.push("leitura tática");
    if (scores.fisica <= 2 && scores.fisica > 0) weaknesses.push("condicionamento físico");
    if (scores.mental <= 2 && scores.mental > 0) weaknesses.push("aspecto mental");
    if (scores.intensidade <= 2 && scores.intensidade > 0) weaknesses.push("intensidade");
    if (weaknesses.length > 0) parts.push(`Precisa evoluir em ${weaknesses.join(", ")}.`);

    if (negativeTags.length > 0) {
      parts.push(`Atenção: ${negativeTags.slice(0, 3).join(", ").toLowerCase()}.`);
    }

    return parts.join(" ");
  }, [scores, positiveTags, negativeTags, foot]);

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
