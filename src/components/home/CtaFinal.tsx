import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import campo from "@/assets/home/cta-campo.jpg";
import { Reveal } from "./Reveal";

export function CtaFinal() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border">
      <img
        src={campo}
        alt="Campo de futebol iluminado à noite"
        loading="lazy"
        width={1808}
        height={912}
        className="absolute inset-0 -z-10 h-full w-full object-cover saturate-[0.7]"
      />
      <div className="absolute inset-0 -z-10 bg-blue-dark/80" />

      <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-10 lg:py-40">
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-gold-light">
            <span className="h-px w-10 bg-gold-light/60" />
            Pelé Scout
          </p>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] text-slate-50 lg:text-6xl">
            Seu próximo capítulo começa aqui.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-200">
            Uma peneira pode mudar o rumo de uma carreira. Crie seu perfil, seja
            avaliado e mostre o que você já treina há anos.
          </p>
          <Link
            to="/cadastro"
            className="group mt-10 inline-flex h-12 items-center gap-2 bg-primary px-7 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-gold-light"
          >
            Encontrar minha peneira
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
