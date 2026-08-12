import imgTreino from "@/assets/home/academia-treino.jpg";
import imgSonho from "@/assets/home/academia-sonho.jpg";
import imgCaminho from "@/assets/home/academia-caminho.jpg";
import { Eyebrow, Reveal } from "./Reveal";

export function DentroDaAcademia() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-36">
      <Reveal className="max-w-xl">
        <Eyebrow>Dentro da academia</Eyebrow>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-12 lg:gap-8">
        <Reveal className="col-span-2 lg:col-span-5">
          <figure>
            <img
              src={imgTreino}
              alt="Atleta amarrando a chuteira ao lado da bola"
              loading="lazy"
              width={1008}
              height={1408}
              className="h-[320px] w-full object-cover saturate-[0.78] contrast-[1.05] sm:h-[520px] lg:h-[620px]"
            />
            <figcaption className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                Treino
              </span>
              <p className="mt-1 font-display text-xl font-bold">
                Disciplina antes do resultado.
              </p>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={120} className="col-span-2 lg:col-span-7 lg:pt-24">
          <figure>
            <img
              src={imgSonho}
              alt="Atleta jovem concentrado à beira do campo"
              loading="lazy"
              width={1200}
              height={912}
              className="h-[240px] w-full object-cover saturate-[0.78] contrast-[1.05] sm:h-[360px] lg:h-[420px]"
            />
            <figcaption className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                Sonho
              </span>
              <p className="mt-1 font-display text-xl font-bold">
                Todo talento merece uma oportunidade.
              </p>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal
          delay={200}
          className="col-span-2 lg:col-span-6 lg:col-start-4 lg:pt-4"
        >
          <figure>
            <img
              src={imgCaminho}
              alt="Grupo de atletas caminhando em direção ao campo"
              loading="lazy"
              width={1008}
              height={1008}
              className="h-[260px] w-full object-cover saturate-[0.78] contrast-[1.05] sm:h-[420px] lg:h-[480px]"
            />
            <figcaption className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                Caminho
              </span>
              <p className="mt-1 font-display text-xl font-bold">
                O próximo passo começa aqui.
              </p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
