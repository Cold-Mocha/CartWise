"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/state/session-provider";
import { CartSheet } from "./cart-sheet";
import { HeaderSearch } from "./header-search";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

// Toda la navegación vive en el header (sin menú lateral): íconos siempre
// visibles y etiquetas desde lg. El logo lleva al dashboard.
const HEADER_NAV = NAV_ITEMS.filter((item) => item.href !== "/dashboard");

export function AppHeader() {
  const pathname = usePathname();
  const { logout } = useSession();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-4">
        <Link href="/dashboard" aria-label="Cartwise — inicio" className="shrink-0">
          <Logo size={46} className="max-sm:hidden" />
          <Logo size={40} withWordmark={false} className="sm:hidden" />
        </Link>

        {/* Buscador global con autosugerencias (estilo Lider): crece más que
            la nav para quedar largo, con tope en max-w-2xl */}
        <HeaderSearch className="min-w-0 max-w-2xl flex-[3]" />

        {/* Navegación mínima, centrada entre el buscador y el carrito */}
        <nav className="flex flex-1 items-center justify-center gap-0.5 lg:gap-1">
          {HEADER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2.5 text-sm font-semibold transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
              <span className="hidden whitespace-nowrap lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Carrito lateral con las líneas de la compra pendiente */}
          <CartSheet />

          <Button
            variant="destructive"
            size="icon"
            onClick={logout}
            aria-label="Cerrar sesión"
            className="size-11 rounded-lg [&_svg]:size-6"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
