import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/home/Hero";
import { MaisQueUmaPeneira } from "@/components/home/MaisQueUmaPeneira";
import { Historia } from "@/components/home/Historia";
import { DentroDaAcademia } from "@/components/home/DentroDaAcademia";
import { ComoFunciona } from "@/components/home/ComoFunciona";
import { PeneirasSection } from "@/components/home/PeneirasSection";
import { MapaOportunidades } from "@/components/home/MapaOportunidades";
import { Parceiros } from "@/components/home/Parceiros";
import { CtaFinal } from "@/components/home/CtaFinal";
import { fetchPeneirasFromDb } from "@/lib/peneiras.db";
import type { Peneira } from "@/lib/mock-data";

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
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 lg:px-10">
          <Logo className="[&_img]:h-12" />
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/peneiras"
              className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary"
            >
              Peneiras
            </Link>
            <a
              href="#como-funciona"
              className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary"
            >
              Como funciona
            </a>
            <Link
              to="/manual"
              className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary"
            >
              Manual
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden h-10 items-center px-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-primary sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="inline-flex h-10 items-center bg-primary px-5 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-gold-light"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero proxima={proxima} />
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
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center lg:px-10">
          <Logo className="[&_img]:h-12" />
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Link to="/peneiras" className="hover:text-primary">
              Peneiras
            </Link>
            <Link to="/manual" className="hover:text-primary">
              Manual
            </Link>
            <Link to="/suporte" className="hover:text-primary">
              Suporte
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pelé Next Gen — Academia
          </p>
        </div>
      </footer>
    </div>
  );
}
