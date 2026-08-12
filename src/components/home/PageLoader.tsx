import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

const MIN_MS = 650;

/** Cobre a montagem inicial da home com uma tela cheia que some em fade. */
export function PageLoader() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_MS - (Date.now() - start));
      window.setTimeout(() => !cancelled && setDone(true), wait);
    };

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) =>
            window.addEventListener("load", () => r(), { once: true }),
          ),
    ]);

    ready.then(finish);
    const safety = window.setTimeout(finish, 3500);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setGone(true), 600);
    return () => window.clearTimeout(t);
  }, [done]);

  useEffect(() => {
    document.body.style.overflow = gone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background transition-opacity duration-500 motion-reduce:transition-none ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-fade-in">
        <Logo className="[&_img]:h-20 sm:[&_img]:h-24" />
      </div>
      <div className="h-[2px] w-40 overflow-hidden rounded-full bg-border">
        <span className="loader-bar block h-full w-1/3 rounded-full bg-primary" />
      </div>
    </div>
  );
}
