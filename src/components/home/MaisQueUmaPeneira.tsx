import img from "@/assets/home/mais-que-peneira.jpg";
import { Eyebrow, Reveal } from "./Reveal";

export function MaisQueUmaPeneira() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-36">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-4 lg:pt-10">
          <Eyebrow>Mais que uma peneira</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-[3.25rem]">
            O sonho começa antes do primeiro jogo.
          </h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
            Antes da avaliação existe o treino sozinho, o ônibus de madrugada, a
            chuteira remendada. Cada atleta chega com uma história — e uma única
            oportunidade pode ser o começo de um novo capítulo.
          </p>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-8">
          <figure className="relative">
            <img
              src={img}
              alt="Jovens atletas treinando juntos ao final da tarde"
              loading="lazy"
              width={1600}
              height={1104}
              className="h-[300px] w-full object-cover saturate-[0.8] contrast-[1.05] sm:h-[440px] lg:h-[560px]"
            />
            <figcaption className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              Treino de base · Pelé Academia
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
