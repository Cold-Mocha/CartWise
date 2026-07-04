import { Logo } from "@/components/brand/logo";
import { LandingCta } from "@/components/landing/landing-cta";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          <a href="#como-funciona" className="transition-colors hover:text-foreground">
            Cómo funciona
          </a>
          <a href="#destacadas" className="transition-colors hover:text-foreground">
            Diferencias destacadas
          </a>
        </nav>
        <LandingCta size="sm" />
      </div>
    </header>
  );
}
