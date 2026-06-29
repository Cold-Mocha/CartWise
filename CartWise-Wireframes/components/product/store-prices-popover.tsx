"use client";

import * as React from "react";
import { StoreLogo } from "@/components/brand/store-logo";
import { getProductOffers } from "@/lib/api";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SearchItem, StoreOffer } from "@/types/cartwise";

/*
  Panel compacto de precios por supermercado al pasar el cursor (plan §4.6).
  Carga las ofertas reales bajo demanda (solo para productos exactos: el endpoint
  productOffers se indexa por producto_marca). Para comparables genéricos no hay
  detalle por tienda → se muestra un aviso, sin inventar precios.
*/
export function StorePricesPopover({
  item,
  children,
  className,
}: {
  item: SearchItem;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [offers, setOffers] = React.useState<StoreOffer[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const fetched = React.useRef(false);

  const canFetch = item.kind === "product";

  const load = React.useCallback(() => {
    setOpen(true);
    if (!canFetch || fetched.current) return;
    fetched.current = true;
    setLoading(true);
    getProductOffers(item.id)
      .then((data) => {
        const valid = (data.offers ?? []).filter((o) => o.precio != null && o.precio > 0);
        setOffers(valid);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [canFetch, item.id]);

  const best = offers && offers.length ? Math.min(...offers.map((o) => o.precio ?? Infinity)) : null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={load}
      onMouseLeave={() => setOpen(false)}
      onFocus={load}
      onBlur={() => setOpen(false)}
    >
      {children}

      {open && (
        <div
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 text-left shadow-xl"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Precios por supermercado
          </p>

          {!canFetch ? (
            <p className="text-xs text-muted-foreground">
              Comparable por unidad: el detalle por tienda se ve al comparar tu compra.
            </p>
          ) : loading ? (
            <p className="text-xs text-muted-foreground">Cargando precios…</p>
          ) : error ? (
            <p className="text-xs text-muted-foreground">No se pudieron cargar los precios.</p>
          ) : offers && offers.length ? (
            <ul className="space-y-1.5">
              {offers
                .slice()
                .sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0))
                .map((o) => {
                  const isBest = o.precio === best;
                  return (
                    <li key={o.store_id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <StoreLogo name={o.store_label} size={20} />
                        <span className="truncate text-foreground">{o.store_label}</span>
                      </span>
                      <span
                        className={cn(
                          "cw-price shrink-0 font-bold",
                          isBest ? "text-savings" : "text-foreground",
                        )}
                      >
                        {money(o.precio)}
                        {isBest && (
                          <span className="ml-1 text-[10px] font-bold uppercase text-savings">
                            · mejor
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Sin precio disponible en el último snapshot.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
