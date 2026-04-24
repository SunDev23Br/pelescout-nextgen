import { cn } from "@/lib/utils";
import logoImg from "@/assets/pele-next-gen-logo.png";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-blue px-3 py-1.5 shadow-md",
        className,
      )}
    >
      <img
        src={logoImg}
        alt="Pelé Next Gen"
        className="h-12 w-auto object-contain"
      />
    </div>
  );
}
