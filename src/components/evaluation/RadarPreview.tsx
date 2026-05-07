import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarPreviewProps {
  scores: {
    tecnica: number;
    tatica: number;
    fisica: number;
    mental: number;
    intensidade: number;
  };
}

export function RadarPreview({ scores }: RadarPreviewProps) {
  const data = [
    { criterio: "Técnica", nota: scores.tecnica },
    { criterio: "Tática", nota: scores.tatica },
    { criterio: "Física", nota: scores.fisica },
    { criterio: "Mental", nota: scores.mental },
    { criterio: "Intensidade", nota: scores.intensidade },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-bold text-primary mb-2">Radar de Desempenho</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="criterio"
            tick={{ fill: "#e8ecf2", fontSize: 10 }}
          />
          <Radar
            dataKey="nota"
            stroke="#d4af37"
            fill="#d4af37"
            fillOpacity={0.35}
            strokeWidth={2}
            animationDuration={300}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
