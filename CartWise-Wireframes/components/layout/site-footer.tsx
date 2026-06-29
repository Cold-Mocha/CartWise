import { Logo } from "@/components/brand/logo";
import { TransparencyNote } from "@/components/common/transparency-note";

// Footer global persistente. NO lista supermercados cubiertos aquí (plan §3): la
// cobertura se muestra solo en secciones específicas (landing, catálogo).
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo size={28} />
          <p className="max-w-md text-sm text-muted-foreground">
            Compara supermercados chilenos y arma tu compra donde más conviene. Proyecto MVP con fines
            demostrativos.
          </p>
        </div>
        <TransparencyNote className="md:max-w-xs md:text-right" />
      </div>
    </footer>
  );
}
