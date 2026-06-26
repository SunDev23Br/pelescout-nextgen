import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LineChart, Zap } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { DesempenhoTab } from "@/components/desempenho/DesempenhoTab";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Veja suas peneiras anteriores, avaliações dos olheiros e a evolução do seu desempenho.",
      },
    ],
  }),
  component: DesempenhoPage,
});

function DesempenhoPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "atleta") navigate({ to: "/perfil" });
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "atleta") {
    return <AppLayout><div className="h-64" /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Zap className="h-3 w-3" /> Meu desempenho
          </span>
          <h1 className="mt-3 flex items-center gap-2 font-display text-2xl font-extrabold sm:text-3xl">
            <LineChart className="h-6 w-6 text-primary" /> Desempenho
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico das peneiras que você participou e o feedback dos olheiros.
          </p>
        </div>

        <DesempenhoTab />
      </div>
    </AppLayout>
  );
}
