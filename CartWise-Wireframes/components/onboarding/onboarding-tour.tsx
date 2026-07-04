"use client";

import * as React from "react";
import { Search, ShoppingBasket, Scale, TrendingDown, Bookmark, Home, BadgeCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/components/state/app-state";
import { loadJson, saveJson } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
  Recorrido inicial (plan §8): aparece una sola vez tras el primer ingreso demo.
  Explica el flujo principal de Cartwise por pasos (Siguiente / Atrás / Saltar /
  Finalizar) y se guarda en localStorage para no repetirse.
*/

const STEPS = [
  {
    icon: Home,
    title: "Bienvenido a Cartwise",
    text: "Comparamos los supermercados chilenos cubiertos para que compres donde más conviene. Los precios son referenciales según el último snapshot, no en tiempo real.",
  },
  {
    icon: Search,
    title: "Busca productos",
    text: "En Productos buscas como en un supermercado online, por nombre o marca. Al pasar el cursor ves los precios por tienda.",
  },
  {
    icon: ShoppingBasket,
    title: "Arma tu compra pendiente",
    text: "Agrega productos a tu compra pendiente y ajusta cantidades antes de comparar.",
  },
  {
    icon: Scale,
    title: "Compara supermercados",
    text: "Cartwise compara tu compra por tienda, prioriza la cobertura y luego el precio, y te recomienda dónde comprar.",
  },
  {
    icon: TrendingDown,
    title: "Diferencias por precio",
    text: "Marcamos una diferencia como destacada solo cuando supera el 20% entre tiendas. No las confundimos con ofertas temporales.",
  },
  {
    icon: Bookmark,
    title: "Planifica y organiza",
    text: "Guarda una compra como planificada para retomarla luego y usa la despensa para llevar el control de lo que ya tienes en casa.",
  },
  {
    icon: BadgeCheck,
    title: "Confirma tu compra",
    text: "Al confirmar una compra registras el gasto del mes y vuelves al Inicio con todo actualizado.",
  },
];

export function OnboardingTour() {
  const { hydrated, isAuthenticated } = useAppState();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    const done = loadJson<boolean>(STORAGE_KEYS.onboarding, false);
    if (!done) setOpen(true);
  }, [hydrated, isAuthenticated]);

  const finish = () => {
    saveJson(STORAGE_KEYS.onboarding, true);
    setOpen(false);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" />
          </span>
          <DialogTitle className="pt-2">{current.title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{current.text}</p>

        {/* Indicadores de paso */}
        <div className="flex justify-center gap-1.5 py-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-5 bg-primary" : "w-1.5 bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            Saltar
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                Atrás
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish}>
                Finalizar
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
