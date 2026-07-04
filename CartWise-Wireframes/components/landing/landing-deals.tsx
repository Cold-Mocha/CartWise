"use client";

import { useEffect, useState } from "react";
import { DealCard } from "@/components/product/deal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStrongDeals } from "@/lib/api";
import { generalCategory } from "@/lib/categories";
import type { SearchItem } from "@/types/cartwise";

/*
  Diferencias destacadas en la landing pública: grilla estática (sin carrusel
  automático). Solo presentación + enlace a la tienda oficial; no agrega a
  compra ni abre detalle porque la landing es previa al ingreso demo.
*/
export function LandingDeals({ limit = 10 }: { limit?: number }) {
  const [deals, setDeals] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getStrongDeals(120)
      .then((items) => active && setDeals(items.filter((i) => generalCategory(i.categoria)).slice(0, limit)))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [limit]);

  if (error) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        No se pudieron cargar las diferencias destacadas en este momento.
      </p>
    );
  }

  if (!deals) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-lg" />
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {deals.map((item) => (
        <DealCard key={`${item.kind}-${item.id}`} item={item} className="h-full" />
      ))}
    </div>
  );
}
