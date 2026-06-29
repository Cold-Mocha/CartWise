"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type CarouselProps = {
  children: React.ReactNode;
  className?: string;
  /** Activa desplazamiento automático con pausa al hover. */
  autoplay?: boolean;
  autoplayDelay?: number;
  /** Etiqueta accesible para el carrusel. */
  ariaLabel?: string;
};

/*
  Carrusel comercial de Cartwise. Movimiento horizontal con autoplay opcional
  (se pausa al hover y respeta prefers-reduced-motion vía Embla), navegación
  manual con flechas y arrastre. Como usa loop, las flechas siempre avanzan.
  No reemplaza información crítica: es presentación.
*/
export function Carousel({
  children,
  className,
  autoplay = false,
  autoplayDelay = 3200,
  ariaLabel,
}: CarouselProps) {
  // Instancia estable de los plugins (no leemos refs en render).
  const [plugins] = React.useState(() =>
    autoplay
      ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
      : [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true, containScroll: "trimSnaps" },
    plugins,
  );

  return (
    <section className={cn("relative", className)} aria-roledescription="carrusel" aria-label={ariaLabel}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between sm:flex">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Anterior"
          onClick={() => emblaApi?.scrollPrev()}
          className="pointer-events-auto -ml-3 size-9 rounded-full shadow-md"
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Siguiente"
          onClick={() => emblaApi?.scrollNext()}
          className="pointer-events-auto -mr-3 size-9 rounded-full shadow-md"
        >
          <ChevronRight />
        </Button>
      </div>
    </section>
  );
}

export function CarouselSlide({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0 shrink-0 grow-0", className)}>{children}</div>;
}
