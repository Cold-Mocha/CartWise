"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/components/state/session-provider";

// Login del MVP con el layout de la versión anterior: tarjeta centrada con el
// formulario a la izquierda y panel visual de marca a la derecha. La UI se
// presenta como un login de producción, pero por detrás valida las credenciales
// fijas de DEMO_CREDENTIALS (lib/constants.ts); no hay backend de usuarios.
export default function LoginPage() {
  const { loginDemo } = useSession();
  const [usuario, setUsuario] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginDemo(usuario, password)) {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <main className="grid min-h-screen w-full place-items-center bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-6">
      <div className="grid w-full max-w-[1120px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:min-h-[min(86vh,680px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        {/* Lado izquierdo: formulario */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
          <Link
            href="/"
            className="mb-8 inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Volver al inicio
          </Link>

          <Logo />
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesión para preparar tu compra y comparar precios.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                autoComplete="username"
                required
                aria-invalid={error ? true : undefined}
                value={usuario}
                onChange={(event) => {
                  setUsuario(event.target.value);
                  setError(null);
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  aria-invalid={error ? true : undefined}
                  className="pr-11"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full">
              Ingresar
            </Button>
          </form>
        </section>

        {/* Lado derecho: imagen de supermercado con los 3 pasos encima */}
        <aside className="relative hidden lg:block">
          <Image
            src="/images/login-supermercado.jpg"
            alt="Góndola de un supermercado"
            fill
            sizes="(min-width: 1024px) 540px, 0px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-10 pb-12 text-white">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/85">
              Compara y ahorra
            </span>
            <h2 className="max-w-md text-3xl font-extrabold leading-tight">
              Encuentra dónde conviene comprar, en 3 pasos
            </h2>
            <ol className="mt-1 flex flex-col gap-3">
              {[
                "Busca los productos que necesitas",
                "Ajusta las cantidades de tu compra",
                "Compara las 4 tiendas y ahorra",
              ].map((paso, i) => (
                <li key={paso} className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold backdrop-blur-sm">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
