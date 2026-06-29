"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselSlide } from "@/components/ui/carousel";
import { DealCard } from "@/components/product/deal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopDeals } from "@/lib/api";
import type { SearchItem } from "@/types/cartwise";

/*
  Carrusel de "diferencias destacadas": las mayores brechas de precio entre
  supermercados según el snapshot. Se alimenta de /api/deals/top. Si el usuario
  pasa onAdd, las cards agregan a la compra (dashboard); en la landing son solo
  presentación.
*/
export function DealsCarousel({
  limit = 12,
  autoplay = true,
  onAdd,
}: {
  limit?: number;
  autoplay?: boolean;
  onAdd?: (item: SearchItem) => void;
}) {
  const [deals, setDeals] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getTopDeals(limit)
      .then((items) => active && setDeals(items))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [limit]);

  if (error) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        No se pudieron cargar las diferencias destacadas. Verifica que la base del Scrapper esté disponible.
      </p>
    );
  }

  if (!deals) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-[clamp(220px,80vw,280px)]" />
        ))}
      </div>
    );
  }

  if (!deals.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Aún no hay diferencias destacadas en este snapshot.
      </p>
    );
  }

  return (
    <Carousel autoplay={autoplay} ariaLabel="Diferencias destacadas entre supermercados">
      {deals.map((item) => (
        <CarouselSlide key={`${item.kind}-${item.id}`} className="w-[clamp(230px,80vw,280px)]">
          <DealCard item={item} onClick={onAdd} className="h-full" />
        </CarouselSlide>
      ))}
    </Carousel>
  );
}
