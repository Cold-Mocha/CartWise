"use client";

import { useEffect, useState } from "react";
import { LandingProductCard } from "@/components/landing/landing-product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStrongDeals } from "@/lib/api";
import { generalCategory } from "@/lib/categories";
import type { SearchItem } from "@/types/cartwise";

/*
  Productos con mayor diferencia de precio en la landing pública. Se muestran
  solo productos presentes en 3 o más supermercados (criterio interno: la UI no
  lo menciona) para que la brecha refleje una comparación amplia y no un caso
  de 2 tiendas. Solo presentación; las acciones reales viven tras el login.
*/
export function LandingDeals({ limit = 8 }: { limit?: number }) {
  const [deals, setDeals] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getStrongDeals(400)
      .then(
        (items) =>
          active &&
          setDeals(
            items
              .filter((i) => generalCategory(i.categoria) && (i.n_tiendas ?? 0) >= 3)
              .slice(0, limit),
          ),
      )
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [limit]);

  if (error) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        No se pudieron cargar los productos destacados en este momento.
      </p>
    );
  }

  if (!deals) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!deals.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Aún no hay diferencias destacadas.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {deals.map((item) => (
        <LandingProductCard key={`${item.kind}-${item.id}`} item={item} className="h-full" />
      ))}
    </div>
  );
}
