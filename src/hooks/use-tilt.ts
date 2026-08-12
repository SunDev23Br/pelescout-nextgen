import { useCallback, useRef } from "react";

/**
 * Inclinação 3D sutil + brilho que segue o cursor.
 * Define as variáveis CSS --rx, --ry, --mx, --my no elemento.
 * Respeita prefers-reduced-motion.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 6) {
  const ref = useRef<T | null>(null);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || reduced()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    },
    [max],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return { ref, tiltProps: { onMouseMove, onMouseLeave } };
}
