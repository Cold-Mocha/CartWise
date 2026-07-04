import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LandingCta } from "@/components/landing/landing-cta";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/8 via-background to-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" aria-label="Cartwise — inicio">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-7" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Entrar como demo</h1>
            <p className="text-sm text-muted-foreground">
              Cartwise es un MVP de demostración. No hay registro ni autenticación real: entras a una
              sesión de prueba guardada solo en este navegador.
            </p>
          </div>

          <div className="mt-6">
            <LandingCta size="lg" className="w-full" />
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
            Tu compra pendiente, compras planificadas, historial y despensa se guardan localmente para la
            demo. No se envía ningún dato a un servidor de usuarios.
          </div>
        </Card>
      </main>
    </div>
  );
}
