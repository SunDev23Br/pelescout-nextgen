import { useEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export function range(start: number, end: number, step = 1): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i += step) out.push(i);
  return out;
}

interface ScrollPickerProps {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  format?: (v: number) => string;
  className?: string;
  itemHeight?: number;
}

const ITEM_H = 36;

export function ScrollPicker({
  values,
  value,
  onChange,
  ariaLabel,
  format = (v) => String(v),
  className,
  itemHeight = ITEM_H,
}: ScrollPickerProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedIndex = Math.max(
    0,
    values.findIndex((v) => v === value),
  );

  // Center selected item when value changes
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLLIElement>(
      `[data-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedIndex]);

  function handleKey(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(values.length - 1, selectedIndex + 1);
      onChange(values[next]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(0, selectedIndex - 1);
      onChange(values[next]);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(values[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(values[values.length - 1]);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      onChange(values[Math.min(values.length - 1, selectedIndex + 5)]);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      onChange(values[Math.max(0, selectedIndex - 5)]);
    }
  }

  const height = itemHeight * 5; // 5 visible rows

  return (
    <div
      className={cn("relative rounded-lg border border-border bg-bg2", className)}
      style={{ height }}
    >
      {/* Selection indicator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-primary/40 bg-primary/5"
        style={{ height: itemHeight }}
      />
      <ul
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKey}
        className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        style={{ paddingBlock: itemHeight * 2 }}
      >
        {values.map((v, i) => {
          const selected = i === selectedIndex;
          return (
            <li
              key={v}
              data-index={i}
              role="option"
              aria-selected={selected}
              tabIndex={-1}
              onClick={() => onChange(v)}
              className={cn(
                "flex cursor-pointer snap-center items-center justify-center text-base font-medium transition-colors",
                selected
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              style={{ height: itemHeight }}
            >
              {format(v)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
