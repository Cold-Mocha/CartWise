"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "./app-header";
import { SiteFooter } from "./site-footer";
import { useAppState } from "@/components/state/app-state";

/*
  Envoltorio de las pantallas autenticadas. Tras hidratar, si no hay sesión demo
  redirige a /login. Mientras hidrata muestra un fondo neutro para evitar parpadeo.
*/
export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated, isAuthenticated } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
