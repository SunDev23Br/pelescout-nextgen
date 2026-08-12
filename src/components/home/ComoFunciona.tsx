import { Eyebrow, Reveal } from "./Reveal";

const ETAPAS = [
  {
    n: "01",
    t: "Encontre",
    d: "Busque uma peneira compatível com sua idade, posição e região. A lista é pública e atualizada pelos próprios organizadores.",
    r: "Você recebe: data, local exato, faixa etária e vagas restantes.",
  },
  {
    n: "02",
    t: "Inscreva-se",
    d: "Crie sua conta, preencha o perfil de atleta com suas características e confirme a inscrição em poucos minutos.",
    r: "Você recebe: confirmação e lembrete antes do dia da avaliação.",
  },
  {
    n: "03",
    t: "Participe",
    d: "Compareça no dia marcado com documento e material esportivo. As peneiras são organizadas em jogos com tempo definido.",
    r: "Você recebe: minutos reais em campo, com olheiro presente.",
  },
  {
    n: "04",
    t: "Mostre seu potencial",
    d: "Seja avaliado por critérios técnicos, físicos, táticos e psicológicos e acompanhe sua evolução dentro da plataforma.",
    r: "Você recebe: relatório no perfil e visibilidade para clubes.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="surface-blue scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="max-w-2xl">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-5xl">
            Quatro passos entre você e o campo.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            O processo é o mesmo para todo mundo: nada de indicação, taxa
            escondida ou fila de contato. Do primeiro clique ao relatório final,
            tudo fica registrado no seu perfil e pode ser mostrado a qualquer
            clube.
          </p>
        </Reveal>

        <ol className="mt-16 grid gap-y-12 lg:grid-cols-4 lg:gap-x-10">
          {ETAPAS.map((e, i) => (
            <Reveal
              as="li"
              key={e.n}
              delay={i * 120}
              className="group border-t border-border pt-6 transition-transform duration-500 hover:-translate-y-1"
            >
              <p className="font-display text-5xl font-extrabold tracking-[-0.04em] text-foreground/20 transition-colors duration-500 group-hover:text-primary lg:text-6xl">
                {e.n}
              </p>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {e.t}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {e.d}
              </p>
              <p className="mt-4 max-w-xs border-l-2 border-primary/60 pl-3 text-xs leading-relaxed text-foreground/85">
                {e.r}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal
          delay={200}
          className="mt-16 grid gap-6 border-t border-border pt-10 sm:grid-cols-3"
        >
          {[
            [
              "Tem custo?",
              "Não. A inscrição do atleta na plataforma e nas peneiras públicas é gratuita.",
            ],
            [
              "Qual idade posso participar?",
              "Cada peneira define suas categorias — normalmente das Sub-11 às Sub-20.",
            ],
            [
              "E se eu não passar?",
              "O relatório continua no seu perfil e serve como base para as próximas avaliações.",
            ],
          ].map(([q, a]) => (
            <div key={q}>
              <p className="font-display text-base font-bold">{q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
