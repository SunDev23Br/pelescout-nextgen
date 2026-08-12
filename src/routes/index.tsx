import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/home/Hero";
import { GoldButton } from "@/components/home/GoldButton";
import { MaisQueUmaPeneira } from "@/components/home/MaisQueUmaPeneira";
import { Historia } from "@/components/home/Historia";
import { DentroDaAcademia } from "@/components/home/DentroDaAcademia";
import { ComoFunciona } from "@/components/home/ComoFunciona";
import { PeneirasSection } from "@/components/home/PeneirasSection";
import { MapaOportunidades } from "@/components/home/MapaOportunidades";
import { Parceiros } from "@/components/home/Parceiros";
import { CtaFinal } from "@/components/home/CtaFinal";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { fetchPeneirasFromDb } from "@/lib/peneiras.db";
import type { Peneira } from "@/lib/mock-data";

const SECTIONS = [
  { id: "proposito", label: "Propósito" },
  { id: "legado", label: "Legado" },
  { id: "academia", label: "Academia" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "peneiras", label: "Peneiras" },
  { id: "mapa", label: "Mapa" },
  { id: "parceiros", label: "Parceiros" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);


const HOME_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/03615082-b43f-44bc-a325-e562d4b95d20/id-preview-8a2baf9e--9a1282c2-3650-4073-a7fa-efe94d2d29d8.lovable.app-1777083107748.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pelé Scout — Peneiras oficiais e avaliação de atletas" },
      {
        name: "description",
        content:
          "O talento existe, falta a oportunidade. Encontre peneiras oficiais, seja avaliado por olheiros profissionais e acompanhe sua evolução.",
      },
      {
        property: "og:title",
        content: "Pelé Scout — Peneiras oficiais e avaliação de atletas",
      },
      {
        property: "og:description",
        content:
          "Encontre peneiras oficiais em todo o Brasil, seja avaliado por olheiros e dê o próximo passo na sua carreira no futebol.",
      },
      { property: "og:url", content: "https://pelescout-nextgen.lovable.app/" },
      { property: "og:image", content: HOME_OG_IMAGE },
      { name: "twitter:image", content: HOME_OG_IMAGE },
      {
        name: "twitter:title",
        content: "Pelé Scout — Peneiras oficiais e avaliação de atletas",
      },
      {
        name: "twitter:description",
        content:
          "Encontre peneiras oficiais em todo o Brasil e seja avaliado por olheiros profissionais.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://pelescout-nextgen.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Pelé Scout",
          url: "https://pelescout-nextgen.lovable.app",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [peneiras, setPeneiras] = useState<Peneira[]>([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const active = useScrollSpy(SECTION_IDS);


  useEffect(() => {
    fetchPeneirasFromDb()
      .then(setPeneiras)
      .finally(() => setLoading(false));
  }, []);

  const proxima =
    peneiras.find((p) => p.status === "aberta") ?? peneiras[0] ?? null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Logo className="shrink-0 [&_img]:h-10 sm:[&_img]:h-12" />

          <nav className="hidden items-center gap-6 lg:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-active={active === s.id}
                className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/65 transition-colors hover:text-primary data-[active=true]:text-primary"
              >
                {s.label}
                <span
                  className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300"
                  style={{ transform: active === s.id ? "scaleX(1)" : undefined }}
                />
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden h-10 items-center px-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-primary sm:inline-flex"
            >
              Entrar
            </Link>
            <GoldButton href="/cadastro" className="h-10 px-4 text-[10px] sm:px-5 sm:text-[11px]">
              Cadastrar
            </GoldButton>
            <button
              type="button"
              aria-label="Abrir menu de seções"
              onClick={() => setMenu((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
            >
              {menu ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="grid gap-1 border-t border-border px-4 pb-4 pt-3 sm:px-6 lg:hidden">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenu(false)}
                className="rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:bg-bg2 hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <Hero proxima={proxima} loading={loading} />
        <MaisQueUmaPeneira />
        <Historia />
        <DentroDaAcademia />
        <ComoFunciona />
        <PeneirasSection peneiras={peneiras} loading={loading} />
        <MapaOportunidades peneiras={peneiras} />
        <Parceiros />
        <CtaFinal />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-12 lg:flex-row lg:items-start lg:justify-between lg:px-10">
          <div className="max-w-xs">
            <Logo className="[&_img]:h-12" />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Peneiras oficiais, avaliação profissional e um histórico real da
              sua evolução dentro do futebol.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pelé Next Gen — Academia
          </p>
        </div>
      </footer>
    </div>
  );
}

