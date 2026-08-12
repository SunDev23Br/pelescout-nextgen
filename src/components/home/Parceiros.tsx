import logoAcademia from "@/assets/home/parceiro-pele-academia.png";
import logoFederacao from "@/assets/home/parceiro-federacao.png";
import logoLitoral from "@/assets/home/parceiro-ct-litoral.png";
import logoBolaRede from "@/assets/home/parceiro-bola-na-rede.png";
import logoLiga from "@/assets/home/parceiro-liga-sub17.png";
import { Eyebrow, Reveal } from "./Reveal";

const PARCEIROS = [
  { nome: "Pelé Academia", logo: logoAcademia },
  { nome: "Federação Paulista", logo: logoFederacao },
  { nome: "CT Litoral", logo: logoLitoral },
  { nome: "Instituto Bola na Rede", logo: logoBolaRede },
  { nome: "Liga Regional Sub-17", logo: logoLiga },
];

export function Parceiros() {
  const loop = [...PARCEIROS, ...PARCEIROS];

  return (
    <section className="surface-paper">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-24">
        <Reveal className="max-w-xl">
          <Eyebrow>Clubes e parceiros</Eyebrow>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Instituições que organizam peneiras, cedem estrutura e acompanham as
            avaliações registradas na plataforma. Cada relatório pode ser
            compartilhado com esses parceiros com a autorização do atleta.
          </p>
        </Reveal>

        <Reveal
          delay={120}
          className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        >
          <ul className="marquee-track flex w-max items-center gap-16 group-hover:[animation-play-state:paused]">
            {loop.map((p, i) => (
              <li key={`${p.nome}-${i}`} className="shrink-0">
                <img
                  src={p.logo}
                  alt={`Logo ${p.nome}`}
                  loading="lazy"
                  width={992}
                  height={672}
                  className="h-16 w-auto opacity-55 grayscale transition-all duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0 lg:h-20"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
