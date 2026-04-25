import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-light"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pelé Next Gen — A nova geração do futebol começa aqui!" },
      {
        name: "description",
        content:
          "Plataforma oficial Pelé Next Gen para gestão de peneiras de futebol: cadastre-se, participe e seja avaliado pelos melhores olheiros.",
      },
      { name: "author", content: "Pelé Next Gen" },
      { property: "og:title", content: "Pelé Next Gen — A nova geração do futebol começa aqui!" },
      { property: "og:description", content: "Pelé Next Gen is a web app for managing football tryouts and scouting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pelé Next Gen — A nova geração do futebol começa aqui!" },
      { name: "description", content: "Pelé Next Gen is a web app for managing football tryouts and scouting." },
      { name: "twitter:description", content: "Pelé Next Gen is a web app for managing football tryouts and scouting." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/03615082-b43f-44bc-a325-e562d4b95d20/id-preview-8a2baf9e--9a1282c2-3650-4073-a7fa-efe94d2d29d8.lovable.app-1777083107748.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/03615082-b43f-44bc-a325-e562d4b95d20/id-preview-8a2baf9e--9a1282c2-3650-4073-a7fa-efe94d2d29d8.lovable.app-1777083107748.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
