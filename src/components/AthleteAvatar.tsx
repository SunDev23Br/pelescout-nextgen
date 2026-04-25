import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AthleteAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Avatar default para atletas.
 * Mostra a foto do atleta se houver `src`; caso contrário, exibe um
 * placeholder neutro com ícone de usuário sobre fundo da marca.
 */
export function AthleteAvatar({
  src,
  alt = "",
  className,
  iconClassName,
}: AthleteAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-label={alt || "Atleta sem foto"}
      role="img"
      className={cn(
        "flex items-center justify-center rounded-full bg-bg2 text-muted-foreground",
        className,
      )}
    >
      <User className={cn("h-1/2 w-1/2", iconClassName)} strokeWidth={1.75} />
    </div>
  );
}
