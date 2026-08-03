import { cn } from "@/lib/utils";
import logoDark from "@/assets/pele-next-gen-logo.png";
import logoLight from "@/assets/pele-next-gen-logo-light.png";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <img
        src={logoLight}
        alt="Pelé Next Gen"
        className="h-20 w-auto object-contain dark:hidden"
      />
      <img
        src={logoDark}
        alt="Pelé Next Gen"
        aria-hidden="true"
        className="hidden h-20 w-auto object-contain dark:block"
      />
    </div>
  );
}
