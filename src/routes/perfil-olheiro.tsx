import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ScoutProfileView } from "@/components/ScoutProfileView";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/perfil-olheiro")({
  head: () => ({
    meta: [
      { title: "Meu perfil de olheiro — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Vitrine profissional do olheiro: experiência, especialidades, estatísticas de observação e agenda de peneiras.",
      },
      { property: "og:title", content: "Meu perfil de olheiro — Pelé Next Gen" },
      {
        property: "og:description",
        content:
          "Credibilidade e autoridade em um só lugar: estatísticas, competições acompanhadas e avaliações do olheiro.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerfilOlheiroPage,
});

function PerfilOlheiroPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "admin" && user.role !== "suporte")
      navigate({ to: "/perfil" });
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

  return (
    <AppLayout>
      <ScoutProfileView userId={user.id} variant="self" />
    </AppLayout>
  );
}
