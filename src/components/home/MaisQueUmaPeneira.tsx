import img from "@/assets/home/mais-que-peneira.jpg";
import { Eyebrow, Reveal } from "./Reveal";
import { useTilt } from "@/hooks/use-tilt";

export function MaisQueUmaPeneira() {
  const { ref, tiltProps } = useTilt<HTMLDivElement>(4);

  return (
    <section className="surface-blue">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4 lg:pt-10">
            <Eyebrow>Mais que uma peneira</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-[3.25rem]">
              O sonho começa antes do primeiro jogo.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
              Antes da avaliação existe o treino sozinho, o ônibus de madrugada,
              a chuteira remendada. Cada atleta chega com uma história — e uma
              única oportunidade pode ser o começo de um novo capítulo.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Por isso a plataforma não termina no dia da peneira: o histórico
              de avaliações, a evolução das habilidades e os vídeos do atleta
              continuam vivos no perfil, prontos para o próximo olheiro.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-6">
              {[
                ["4 eixos", "técnico, físico, tático e psicológico"],
                ["Histórico", "cada avaliação fica registrada"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-xl font-extrabold text-primary">
                    {a}
                  </dt>
                  <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {b}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-8 [perspective:1200px]">
            <figure ref={ref} {...tiltProps} className="group relative">
              <div className="overflow-hidden rounded-3xl transition-transform duration-500 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] motion-reduce:[transform:none]">
                <img
                  src={img}
                  alt="Jovens atletas treinando juntos ao final da tarde"
                  loading="lazy"
                  width={1600}
                  height={1104}
                  className="h-[300px] w-full object-cover saturate-[0.85] contrast-[1.05] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04] sm:h-[440px] lg:h-[560px]"
                />
              </div>
              <figcaption className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                Treino de base · Pelé Academia
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
