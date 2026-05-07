import { AthleteAvatar } from "@/components/AthleteAvatar";

interface EvaluationCardProps {
  nome: string;
  posicao: string;
  idade: number;
  avatar?: string;
  clube?: string;
}

export function EvaluationCard({ nome, posicao, idade, avatar, clube }: EvaluationCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
      <AthleteAvatar
        src={avatar}
        alt={nome}
        className="h-12 w-12 border-2 border-primary"
      />
      <div className="flex-1 min-w-0">
        <h2 className="font-display text-base font-extrabold truncate">{nome}</h2>
        <p className="text-xs text-muted-foreground">
          {posicao} · {idade} anos{clube ? ` · ${clube}` : ""}
        </p>
      </div>
    </div>
  );
}
