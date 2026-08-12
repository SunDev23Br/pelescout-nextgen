import { Eyebrow, Reveal } from "./Reveal";

const ETAPAS = [
  {
    n: "01",
    t: "Encontre",
    d: "Encontre uma peneira compatível com seu perfil, idade e região.",
  },
  { n: "02", t: "Inscreva-se", d: "Realize sua inscrição em poucos minutos." },
  { n: "03", t: "Participe", d: "Compareça à avaliação no dia marcado." },
  {
    n: "04",
    t: "Mostre seu potencial",
    d: "Seja avaliado por olheiros e dê o próximo passo na sua trajetória.",
  },
];

export function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      className="border-y border-border scroll-mt-16"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="max-w-xl">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-5xl">
            Quatro passos entre você e o campo.
          </h2>
        </Reveal>

        <ol className="mt-16 grid gap-y-10 lg:grid-cols-4 lg:gap-x-10">
          {ETAPAS.map((e, i) => (
            <Reveal
              as="li"
              key={e.n}
              delay={i * 120}
              className="border-t border-border pt-6"
            >
              <p className="font-display text-5xl font-extrabold tracking-[-0.04em] text-foreground/15 lg:text-6xl">
                {e.n}
              </p>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {e.t}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {e.d}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
