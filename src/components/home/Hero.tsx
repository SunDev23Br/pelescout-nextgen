import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Peneira } from "@/lib/mock-data";
import { Reveal } from "./Reveal";
import { AuthLink } from "./AuthLink";
import { ProximaPeneiraCard } from "./ProximaPeneiraCard";

export function Hero({
  proxima,
  loading,
}: {
  proxima: Peneira | null;
  loading: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-16">
        <div className="flex flex-col justify-center">
          <Reveal immediate>
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              <span className="h-px w-10 bg-primary/60" />
              Pelé Scout · Plataforma oficial
            </p>
          </Reveal>

          <Reveal immediate delay={120}>
            <h1 className="mt-7 max-w-[16ch] font-display text-[2.75rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-[5.25rem]">
              O talento existe.
              <br />
              Falta a <span className="text-primary">oportunidade</span>.
            </h1>
          </Reveal>

          <Reveal immediate delay={240}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
              O Pelé Scout conecta atletas a peneiras oficiais e a olheiros que
              avaliam, registram e acompanham cada passo da sua trajetória.
              Você se inscreve em minutos, participa da avaliação presencial e
              recebe um relatório com notas técnicas, físicas e táticas — tudo
              guardado no seu perfil para os clubes verem.
            </p>
          </Reveal>

          <Reveal immediate delay={360}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <AuthLink
                href="/peneiras"
                className="group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-gold transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                Encontrar minha peneira
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </AuthLink>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-bold uppercase tracking-[0.12em] transition-colors hover:border-primary hover:text-primary"
              >
                Como funciona
              </a>
            </div>
          </Reveal>

          <Reveal immediate delay={480}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              {[
                ["Gratuito", "para o atleta"],
                ["Olheiros", "credenciados"],
                ["Relatório", "após a avaliação"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-lg font-extrabold text-primary">
                    {a}
                  </dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{b}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal immediate delay={300} className="relative">
          <ProximaPeneiraCard peneira={proxima} loading={loading} />
        </Reveal>
      </div>
    </section>
  );
}
