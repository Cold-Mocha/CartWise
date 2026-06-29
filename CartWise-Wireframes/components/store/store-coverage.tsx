import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMING_SOON_STORES, COVERED_STORES } from "@/lib/constants";

// Iniciales/colores de marca por tienda para los chips (sin usar logos protegidos).
const STORE_STYLE: Record<string, { initials: string; className: string }> = {
  Jumbo: { initials: "J", className: "bg-green-600 text-white" },
  "Santa Isabel": { initials: "SI", className: "bg-red-600 text-white" },
  Unimarc: { initials: "U", className: "bg-amber-500 text-white" },
  "El Trébol": { initials: "ET", className: "bg-emerald-700 text-white" },
  Tottus: { initials: "T", className: "bg-muted text-muted-foreground" },
  "Líder": { initials: "L", className: "bg-muted text-muted-foreground" },
};

function StoreChip({ name, soon }: { name: string; soon?: boolean }) {
  const style = STORE_STYLE[name] ?? { initials: name.slice(0, 2), className: "bg-muted text-muted-foreground" };
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-full border bg-card py-1.5 pl-1.5 pr-4 shadow-sm",
        soon ? "border-dashed border-border opacity-80" : "border-border",
      )}
    >
      <span className={cn("flex size-8 items-center justify-center rounded-full text-xs font-extrabold", style.className)}>
        {style.initials}
      </span>
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
