import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import imgTreino from "@/assets/home/academia-treino.jpg";
import imgSonho from "@/assets/home/academia-sonho.jpg";
import imgCaminho from "@/assets/home/academia-caminho.jpg";
import imgDesenvolvimento from "@/assets/home/timeline-desenvolvimento.jpg";
import imgColetivo from "@/assets/home/mais-que-peneira.jpg";
import { Eyebrow, Reveal } from "./Reveal";

const SLIDES = [
  {
    img: imgTreino,
    tag: "Treino",
    titulo: "Disciplina antes do resultado.",
    texto:
      "Antes de qualquer avaliação existe rotina: fundamentos, repetição e cuidado com o corpo. É esse trabalho invisível que aparece nos 90 minutos em que o olheiro está olhando.",
  },
  {
    img: imgDesenvolvimento,
    tag: "Desenvolvimento",
    titulo: "Cada posição tem um caminho.",
    texto:
      "Goleiros, laterais, meias e atacantes são observados por critérios diferentes. A plataforma registra a avaliação por competência, e não uma nota única e genérica.",
  },
  {
    img: imgSonho,
    tag: "Sonho",
    titulo: "Todo talento merece uma oportunidade.",
    texto:
      "Muita gente boa nunca foi vista simplesmente porque não sabia onde e quando acontecia a próxima peneira. Aqui essa informação é pública e organizada.",
  },
  {
    img: imgColetivo,
    tag: "Coletivo",
    titulo: "O jogo mostra o que o teste esconde.",
    texto:
      "As peneiras são estruturadas em jogos reais, com tempo e número de participantes definidos, para que cada atleta tenha minutos de verdade em campo.",
  },
  {
    img: imgCaminho,
    tag: "Caminho",
    titulo: "O próximo passo começa aqui.",
    texto:
      "Depois da avaliação, o atleta recebe o feedback do olheiro no próprio perfil e passa a aparecer nas buscas de clubes que procuram exatamente aquele perfil.",
  },
];

export function DentroDaAcademia() {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    setI((prev) => (n + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (pausado) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = window.setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(t);
  }, [pausado]);

  return (
    <section id="academia" className="surface-paper scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow>Dentro da academia</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-5xl">
              O que acontece entre a inscrição e o contrato.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Arraste para percorrer as etapas da rotina de formação — do treino
              individual ao momento em que o clube entra em contato.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Slide anterior"
              onClick={() => go(i - 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próximo slide"
              onClick={() => go(i + 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        <Reveal
          delay={120}
          className="mt-12 overflow-hidden rounded-3xl border border-border shadow-card"
        >
          <div
            ref={trackRef}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onPointerDown={(e) => (dragX.current = e.clientX)}
            onPointerUp={(e) => {
              if (dragX.current === null) return;
              const d = e.clientX - dragX.current;
              if (Math.abs(d) > 50) go(d < 0 ? i + 1 : i - 1);
              dragX.current = null;
            }}
            className="flex touch-pan-y transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SLIDES.map((s, idx) => (
              <div key={s.tag} className="w-full shrink-0">
                <div className="grid lg:grid-cols-[1.25fr_1fr]">
                  <div className="group relative overflow-hidden">
                    <img
                      src={s.img}
                      alt={s.titulo}
                      loading={idx === 0 ? "eager" : "lazy"}
                      width={1200}
                      height={800}
                      className="h-[280px] w-full object-cover saturate-[0.85] contrast-[1.05] transition-transform duration-[1400ms] ease-out group-hover:scale-105 sm:h-[400px] lg:h-[520px]"
                      draggable={false}
                    />
                  </div>
                  <div className="flex flex-col justify-center bg-bg2 p-8 lg:p-12">
                    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                      {s.tag}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight lg:text-3xl">
                      {s.titulo}
                    </h3>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                      {s.texto}
                    </p>
                    <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                      {String(idx + 1).padStart(2, "0")} /{" "}
                      {String(SLIDES.length).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-6 flex items-center justify-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.tag}
              type="button"
              aria-label={`Ir para ${s.tag}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === i ? "w-10 bg-primary" : "w-4 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
