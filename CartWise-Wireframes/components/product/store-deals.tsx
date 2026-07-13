"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLogo } from "@/components/brand/store-logo";
import { DealsRow } from "./browse-deals";
import { getStoreDeals } from "@/lib/api";
import { sortImageFirst } from "@/lib/basket";
import { generalCategory } from "@/lib/categories";
import type { SearchItem, StoreDeals } from "@/types/cartwise";

/*
  Ofertas reales por supermercado: una sección por cadena (logo + nombre en el
  título) con sus mejores promociones del snapshot en una fila desplazable, con
  la misma tarjeta de producto de la guía /style. El descuento aquí es DENTRO
  de la misma cadena (oferta_real), no la brecha entre supermercados. No
  inventa datos.
*/

const PER_STORE_SHOWN = 12;

// Solo comida/aseo (excluye alcohol) y una oferta por categoría granular para
// dar variedad (evita 4 jabones Dove casi idénticos); con foto primero.
function pickItems(store: StoreDeals): SearchItem[] {
  const seen = new Set<string>();
  const out: SearchItem[] = [];
  for (const it of sortImageFirst(store.items)) {
    if (!generalCategory(it.categoria)) continue;
    const key = (it.categoria ?? "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
    if (out.length >= PER_STORE_SHOWN) break;
  }
  return out;
}

export function StoreDealsSection({
  onAdd,
  onOpenDetail,
}: {
  onAdd: (item: SearchItem) => void;
  onOpenDetail: (item: SearchItem) => void;
}) {
  const [stores, setStores] = useState<StoreDeals[] | null>(null);

  useEffect(() => {
    let active = true;
    getStoreDeals(40)
      .then((data) => active && setStores(data))
      .catch(() => active && setStores([]));
    return () => {
      active = false;
    };
  }, []);

  const sections = useMemo(
    () =>
      (stores ?? [])
        .map((store) => ({ store, items: pickItems(store) }))
        .filter((s) => s.items.length > 0),
    [stores],
  );

  if (!stores) {
    return (
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-9 w-64" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-72 w-[45%] shrink-0 rounded-xl sm:w-[31%] lg:w-[19%]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!sections.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Sin ofertas temporales por ahora.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map(({ store, items }) => (
        <section key={store.store_key} className="space-y-4">
          <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            <StoreLogo name={store.store_label} size={36} className="shrink-0" />
            {store.store_label}
          </h3>
          <DealsRow items={items} onAdd={onAdd} onOpenDetail={onOpenDetail} />
        </section>
      ))}
    </div>
  );
}
