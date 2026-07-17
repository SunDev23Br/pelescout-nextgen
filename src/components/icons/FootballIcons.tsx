// Custom SVG football-themed icons (dourado/azul-marinho).
// Use currentColor so parents can theme via text-primary / text-primary-foreground.
// Small helper wrapper standardises sizing props.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: IconProps) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

/** Bola de futebol clássica (hexágonos). */
export function BallIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.2" />
      <polygon points="12,7 15.5,9.4 14.2,13.4 9.8,13.4 8.5,9.4" fill="currentColor" fillOpacity="0.18" />
      <path d="M12 2.8 12 7" />
      <path d="M15.5 9.4 20 8.2" />
      <path d="M14.2 13.4 17 17.4" />
      <path d="M9.8 13.4 7 17.4" />
      <path d="M8.5 9.4 4 8.2" />
    </svg>
  );
}

/** Campo de futebol visto de cima. */
export function FieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M2.5 8.5 H6 V15.5 H2.5" />
      <path d="M21.5 8.5 H18 V15.5 H21.5" />
    </svg>
  );
}

/** Chuteira (perfil lateral). */
export function BootIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 15c0-1.4 1-2.4 2.4-2.4h5l1.6-4.6c.3-.9 1.2-1.5 2.2-1.5h1.4c1.3 0 2.4 1.1 2.4 2.4v2.2c0 .7.3 1.3.8 1.8l1.7 1.6c.7.6 1 1.5 1 2.4v.9c0 1-.8 1.8-1.8 1.8H5.2C4 20.6 3 19.6 3 18.4Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M6 20.5v-1.4M9 20.5v-1.4M12 20.5v-1.4M15 20.5v-1.4M18 20.5v-1.4" />
      <path d="M6 15.6h6" />
    </svg>
  );
}

/** Troféu customizado (alças mais marcadas). */
export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10v4.5a5 5 0 0 1-10 0Z" fill="currentColor" fillOpacity="0.16" />
      <path d="M7 5.5H4.5A1.5 1.5 0 0 0 3 7v1.2A3.8 3.8 0 0 0 6.8 12" />
      <path d="M17 5.5h2.5A1.5 1.5 0 0 1 21 7v1.2A3.8 3.8 0 0 1 17.2 12" />
      <path d="M9.5 13.5 9 17h6l-.5-3.5" />
      <rect x="7.5" y="17" width="9" height="2.4" rx="0.6" />
    </svg>
  );
}

/** Apito de árbitro. */
export function WhistleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 13c0-2.8 2.2-5 5-5h7l5-2v10l-5-2h-2.2A5 5 0 1 1 3 13Z" fill="currentColor" fillOpacity="0.14" />
      <circle cx="8" cy="13" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Trave/gol. */
export function GoalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 6h18v13" />
      <path d="M3 6v13" />
      <path d="M3 19h18" />
      <path d="M6 9v10M9 9v10M12 9v10M15 9v10M18 9v10" strokeWidth="0.9" />
      <path d="M3 9h18M3 12h18M3 15h18" strokeWidth="0.9" />
    </svg>
  );
}

/** Escolhe um ícone por chave de habilidade. */
export const SKILL_ICON: Record<string, (p: IconProps) => JSX.Element> = {
  marcacao: WhistleIcon,
  forca: BootIcon,
  passe: FieldIcon,
  velocidade: BallIcon,
  posicionamento: GoalIcon,
};

/** Rotação de ícones para cards de conquistas. */
export const ACHIEVEMENT_ICONS = [TrophyIcon, BallIcon, BootIcon, FieldIcon, WhistleIcon, GoalIcon];
