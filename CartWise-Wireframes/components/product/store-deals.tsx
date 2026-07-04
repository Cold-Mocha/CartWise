"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLogo } from "@/components/brand/store-logo";
import { ProductImage } from "@/components/product/product-image";
import { getStoreDeals } from "@/lib/api";
import { generalCategory } from "@/lib/categories";
import { money } from "@/lib/format";
import type { SearchItem, StoreDeals } from "@/types/cartwise";

/*
  Ofertas reales por supermercado en una grilla 2x2 (una tarjeta por cadena).
  Cada tarjeta muestra las mejores promociones de esa tienda en el snapshot:
  precio de lista tachado + precio de oferta + % de descuento. Es distinto de
  "Diferencias destacadas": aquí el descuento es DENTRO de la misma cadena
  (oferta_real), no la brecha entre supermercados. No inventa datos.
*/

const PER_STORE_SHOWN = 4;

function OfferRow({ item, onOpenDetail }: { item: SearchItem; onOpenDetail: (item: SearchItem) => void }) {
  const lista = item.precio_lista ?? 0;
  const precio = item.precio_min ?? 0;
  const pct = lista > precio && lista > 0 ? Math.round(((lista - precio) / lista) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onOpenDetail(item)}
      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
      aria-label={`Ver detalle de ${item.nombre}`}
    >
      <div className="size-11 shrink-0 rounded-md bg-white p-1">
        <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.nombre}</p>
        <p className="flex items-baseline gap-1.5">
          <span className="cw-price text-sm font-extrabold text-foreground">{money(precio)}</span>
          {pct > 0 && (
            <span className="cw-price text-xs text-muted-foreground line-through">{money(lista)}</span>
          )}
        </p>
      </div>
      {pct > 0 && <Badge variant="savings" className="shrink-0">-{pct}%</Badge>}
    </button>
  );
}

function StoreCard({
  store,
  onOpenDetail,
}: {
  store: StoreDeals;
  onOpenDetail: (item: SearchItem) => void;
}) {
  // Solo comida/aseo (excluye alcohol) y una oferta por categoría granular para
  // dar variedad (evita 4 jabones Dove casi idénticos).
  const items = useMemo(() => {
    const seen = new Set<string>();
    const out: SearchItem[] = [];
    for (const it of store.items) {
      if (!generalCategory(it.categoria)) continue;
      const key = (it.categoria ?? "").toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
      if (out.length >= PER_STORE_SHOWN) break;
    }
    return out;
  }, [store.items]);

  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <StoreLogo name={store.store_label} size={28} />
          <p className="font-extrabold tracking-tight text-foreground">{store.store_label}</p>
        </div>
        {items.length ? (
          <div className="flex flex-col">
            {items.map((item) => (
              <OfferRow key={item.id} item={item} onOpenDetail={onOpenDetail} />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin ofertas en este snapshot.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StoreDealsSection({ onOpenDetail }: { onOpenDetail: (item: SearchItem) => void }) {
  const [stores, setStores] = useState<StoreDeals[] | null>(null);

  useEffect(() => {
    let active = true;
    getStoreDeals(16)
      .then((data) => active && setStores(data))
      .catch(() => active && setStores([]));
    return () => {
      active = false;
    };
  }, []);

  if (!stores) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const withOffers = stores.filter((s) => s.items.some((i) => generalCategory(i.categoria)));

  if (!withOffers.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Sin ofertas temporales en este snapshot.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {withOffers.map((store) => (
        <StoreCard key={store.store_key} store={store} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  );
}
