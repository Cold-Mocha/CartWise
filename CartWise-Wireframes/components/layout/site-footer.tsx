import { Logo } from "@/components/brand/logo";

// Footer global persistente. NO lista supermercados cubiertos ni notas de
// snapshot aquí: se mantiene mínimo.
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:px-6">
        <Logo size={28} />
        <p className="max-w-md text-sm text-muted-foreground">
          Compara supermercados chilenos y arma tu compra donde más conviene.
        </p>
      </div>
    </footer>
  );
}
