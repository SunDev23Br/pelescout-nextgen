import { cn } from "@/lib/utils";
import logoImg from "@/assets/pele-next-gen-logo.png";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={logoImg}
        alt="Pelé Next Gen"
        className="h-12 w-auto object-contain"
      />
    </div>
  );
}
