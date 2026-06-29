import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreLogo } from "@/components/brand/store-logo";
import { COMING_SOON_STORES, COVERED_STORES } from "@/lib/constants";

function StoreChip({ name, soon }: { name: string; soon?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-full border bg-card py-1.5 pl-1.5 pr-4 shadow-sm",
        soon ? "border-dashed border-border opacity-80" : "border-border",
      )}
    >
      <StoreLogo name={name} size={32} className="rounded-full" />
      <span className="text-sm font-bold text-foreground">{name}</span>
      {soon ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Clock className="size-3" /> Próximamente
        </span>
      ) : (
        <Check className="size-4 text-primary" aria-label="Cubierto" />
      )}
    </div>
  );
}

// Supermercados cubiertos + próximamente. NO mostrar Tottus/Líder como activos
// (plan §10).
export function StoreCoverage({ className, showSoon = true }: { className?: string; showSoon?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {COVERED_STORES.map((name) => (
        <StoreChip key={name} name={name} />
      ))}
      {showSoon && COMING_SOON_STORES.map((name) => <StoreChip key={name} name={name} soon />)}
    </div>
  );
}
