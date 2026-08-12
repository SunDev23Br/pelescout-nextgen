import { Eyebrow, Reveal } from "./Reveal";

const PARCEIROS = [
  "Pelé Academia",
  "Federação Paulista",
  "Centro de Treinamento Litoral",
  "Instituto Bola na Rede",
  "Liga Regional Sub-17",
];

export function Parceiros() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-24">
      <Reveal className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Clubes e parceiros</Eyebrow>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Instituições que acompanham as avaliações da plataforma.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6 lg:justify-end">
          {PARCEIROS.map((p) => (
            <li
              key={p}
              className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/45 transition-colors hover:text-foreground/80"
            >
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
