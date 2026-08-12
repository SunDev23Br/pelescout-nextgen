import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/home/hero-athlete.jpg";
import type { Peneira } from "@/lib/mock-data";

function formatData(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

export function Hero({ proxima }: { proxima: Peneira | null }) {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-16">
        <div className="flex flex-col justify-center">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
            <span className="h-px w-10 bg-primary/60" />
            Pelé Scout · Plataforma oficial
          </p>

          <h1 className="mt-7 max-w-[16ch] font-display text-[2.75rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-[5.25rem]">
            O talento existe.
            <br />
            Falta a{" "}
            <span className="text-primary">oportunidade</span>.
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
            O Pelé Scout conecta atletas a peneiras oficiais e a olheiros que
            avaliam, registram e acompanham cada passo da sua trajetória.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/peneiras"
              className="group inline-flex h-12 items-center gap-2 bg-primary px-7 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-gold-light"
            >
              Encontrar minha peneira
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center border-b border-foreground/25 px-1 text-sm font-bold uppercase tracking-[0.12em] transition-colors hover:border-primary hover:text-primary"
            >
              Como funciona
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden">
            <img
              src={heroImg}
              alt="Jovem atleta conduzindo a bola em campo ao entardecer"
              width={1280}
              height={1600}
              className="h-[380px] w-full object-cover object-top saturate-[0.82] contrast-[1.05] sm:h-[520px] lg:h-[640px]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
          </div>

          {proxima && (
            <div className="mt-4 flex items-baseline gap-4 border-t border-border pt-4 lg:absolute lg:inset-x-0 lg:bottom-6 lg:mt-0 lg:border-t-0 lg:px-6 lg:pt-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                Próxima
              </span>
              <p className="truncate text-sm text-foreground/90">
                {proxima.titulo} · {proxima.cidade}/{proxima.estado} ·{" "}
                {formatData(proxima.data)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
