import img1969 from "@/assets/home/timeline-1969.jpg";
import imgDesenv from "@/assets/home/timeline-desenvolvimento.jpg";
import imgExp from "@/assets/home/timeline-expansao.jpg";
import imgHoje from "@/assets/home/timeline-presente.jpg";
import { Eyebrow, Reveal } from "./Reveal";
import { useTilt } from "@/hooks/use-tilt";

const MARCOS = [
  {
    ano: "1969",
    titulo: "A origem",
    texto:
      "Nasce a formação de base que carrega o nome de Pelé: ensinar futebol como ofício, disciplina e caminho.",
    img: img1969,
    alt: "Registro histórico de meninos em um campo de terra",
  },
  {
    ano: "Desenvolvimento",
    titulo: "Metodologia própria",
    texto:
      "Treinamento estruturado por categoria, avaliação técnica constante e acompanhamento individual de cada atleta.",
    img: imgDesenv,
    alt: "Treinador orientando um grupo de jovens atletas",
  },
  {
    ano: "Expansão",
    titulo: "Do bairro ao país",
    texto:
      "Peneiras em diferentes estados ampliam o alcance e levam a avaliação para onde o talento está.",
    img: imgExp,
    alt: "Centenas de jovens atletas reunidos em uma peneira",
  },
  {
    ano: "Presente",
    titulo: "Pelé Scout",
    texto:
      "A avaliação vira dado: olheiros registram desempenho, o atleta acompanha sua evolução e clubes encontram quem procuram.",
    img: imgHoje,
    alt: "Olheiro avaliando uma partida com tablet à beira do campo",
  },
];

function MarcoFoto({ src, alt }: { src: string; alt: string }) {
  const { ref, tiltProps } = useTilt<HTMLDivElement>(4);

  return (
    <div
      ref={ref}
      {...tiltProps}
      className="group/foto relative mt-6 overflow-hidden [perspective:900px] transition-shadow duration-500 hover:shadow-[0_18px_40px_-18px_var(--shadow-gold-c)] motion-reduce:transition-none"
      style={{
        transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        "--shadow-gold-c":
          "color-mix(in oklab, var(--primary) 55%, transparent)",
      } as React.CSSProperties}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={900}
        height={700}
        className="h-44 w-full object-cover saturate-[0.75] contrast-[1.05] transition-[transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/foto:scale-[1.07] group-hover/foto:saturate-100 group-hover/foto:contrast-100 motion-reduce:transition-none motion-reduce:group-hover/foto:scale-100 lg:h-40"
      />
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/foto:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--primary) 32%, transparent), transparent 65%)",
        }}
      />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-transparent transition-colors duration-500 group-hover/foto:ring-primary/50" />
    </div>
  );
}

export function Historia() {
  return (
    <section id="legado" className="border-y border-border bg-bg2/40 scroll-mt-24">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="max-w-2xl">
          <Eyebrow>Legado</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-[3.25rem]">
            Existe história por trás desta oportunidade.
          </h2>
        </Reveal>

        <ol className="mt-16 grid gap-12 border-l border-border pl-6 sm:pl-8 lg:grid-cols-4 lg:gap-8 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-10">
          {MARCOS.map((m, i) => (
            <Reveal
              as="li"
              key={m.ano}
              delay={i * 140}
              className="group relative lg:pr-6"
            >
              <span className="absolute -left-[27px] top-2 h-2 w-2 rounded-full bg-primary transition-transform duration-500 group-hover:scale-150 sm:-left-[35px] lg:-top-[45px] lg:left-0" />
              <p className="font-display text-2xl font-extrabold tracking-[-0.02em] text-primary transition-transform duration-500 group-hover:translate-x-1 lg:text-3xl">
                {m.ano}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold">{m.titulo}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {m.texto}
              </p>
              <MarcoFoto src={m.img} alt={m.alt} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
