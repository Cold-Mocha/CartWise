"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Search, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAppState } from "@/components/state/app-state";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const { basketUnits, logout } = useAppState();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Menú móvil */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-2 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    <item.icon className="size-4" /> {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" aria-label="Cartwise — inicio">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" aria-label="Buscar productos">
            <Link href="/productos">
              <Search />
            </Link>
          </Button>

          <Button
            asChild
            variant={basketUnits > 0 ? "default" : "outline"}
            className="relative gap-2 transition-colors"
          >
            <Link href="/compra-pendiente" aria-label="Ver compra pendiente">
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Compra pendiente</span>
              {basketUnits > 0 && (
                <Badge
                  key={basketUnits}
                  variant="savings"
                  className="cw-pop ml-0.5 rounded-full bg-primary-foreground px-1.5 py-0 text-[11px] text-primary"
                >
                  {basketUnits}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={logout} aria-label="Salir de la demo">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
