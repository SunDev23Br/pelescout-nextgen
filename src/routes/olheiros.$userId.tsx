import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ScoutProfileView } from "@/components/ScoutProfileView";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/olheiros/$userId")({
  head: () => ({
    meta: [
      { title: "Perfil do olheiro — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Conheça o olheiro: experiência, especialidades, competições acompanhadas e agenda de peneiras.",
      },
      { property: "og:title", content: "Perfil do olheiro — Pelé Next Gen" },
      {
        property: "og:description",
        content:
          "Experiência, especialidades e estatísticas do olheiro na Pelé Next Gen.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OlheiroPublicoPage,
});

function OlheiroPublicoPage() {
  const { userId } = Route.useParams();
  const { user, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (user.id === userId) {
    return (
      <AppLayout>
        <ScoutProfileView userId={userId} variant="self" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto mb-4 max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.back()}
          aria-label="Voltar"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <ScoutProfileView userId={userId} variant="public" />
    </AppLayout>
  );
}
