"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Testimonios de la landing en carrusel horizontal (referencia: tarjetas con
  cita en cursiva, nombre y estrellas, flechas laterales y puntos de paginación).
  Contenido ilustrativo escrito a mano para la vitrina pública (no proviene de
  usuarios reales ni de ninguna base de datos).
*/
const REVIEWS = [
  {
    quote:
      "Antes recorría dos supermercados comparando precios a ojo. Ahora armo mi lista en Cartwise y sé al tiro dónde me conviene hacer la compra del mes.",
    name: "Valentina M.",
    place: "Temuco",
    stars: 5,
  },
  {
    quote:
      "Lo uso todas las semanas antes de la compra grande. La diferencia se nota en el presupuesto: el mismo carro puede costar miles de pesos menos según la tienda.",
    name: "Rodrigo S.",
    place: "Padre Las Casas",
    stars: 5,
  },
  {
    quote:
      "Me encanta que muestre las diferencias de precio entre tiendas de forma tan clara. He ahorrado más de lo que pensaba en productos que compro siempre.",
    name: "Carolina P.",
    place: "Temuco",
    stars: 4,
  },
  {
    quote:
      "Simple y directo: armo la lista, comparo y listo. El plan recomendado me ordenó las compras de la casa de una manera que ninguna otra app había logrado.",
    name: "Felipe A.",
    place: "Villarrica",
    stars: 5,
  },
  {
    quote:
      "La despensa es lo mejor: sé exactamente qué tengo y qué falta antes de salir a comprar, y el historial me muestra cuánto llevo gastado en el mes.",
    name: "Marcela R.",
    place: "Temuco",
    stars: 5,
  },
  {
    quote:
      "Encontré diferencias enormes en cosas tan básicas como el aceite y el arroz. Ahora no pago de más: comparo todo en Cartwise antes de ir al supermercado.",
    name: "Jorge L.",
    place: "Lautaro",
    stars: 4,
  },
];

export function LandingReviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [selected, setSelected] = React.useState(0);
  const [snaps, setSnaps] = React.useState<number[]>([]);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    const reInit = () => {
      setSnaps(emblaApi.scrollSnapList());
      sync();
    };
    reInit();
    emblaApi.on("select", sync);
    emblaApi.on("reInit", reInit);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", reInit);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-5 flex">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="min-w-0 flex-[0_0_100%] pl-5 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <figure className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                <blockquote className="text-sm italic leading-relaxed text-muted-foreground">
                  “{review.quote}”
                </blockquote>
                <figcaption className="mt-auto space-y-1.5">
                  <p className="text-sm font-bold text-foreground">
                    {review.name}{" "}
                    <span className="font-medium text-muted-foreground">· {review.place}</span>
                  </p>
                  <div className="flex gap-0.5" aria-label={`${review.stars} de 5 estrellas`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < review.stars
                            ? "size-4 fill-amber-400 text-amber-400"
                            : "size-4 text-border"
                        }
                      />
                    ))}
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        aria-label="Testimonios anteriores"
        className="absolute -left-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-accent disabled:opacity-40 md:flex"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        aria-label="Más testimonios"
        className="absolute -right-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-accent disabled:opacity-40 md:flex"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {snaps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Ir al grupo de testimonios ${i + 1}`}
            className={cn(
              "size-2.5 rounded-full transition-colors",
              i === selected ? "bg-primary" : "bg-border hover:bg-muted-foreground/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
