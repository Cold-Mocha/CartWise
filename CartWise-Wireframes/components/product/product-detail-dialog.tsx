"use client";

import * as React from "react";
import { Plus, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoreLogo } from "@/components/brand/store-logo";
import { ProductImage } from "./product-image";
import { getProductOffers } from "@/lib/api";
import { money } from "@/lib/format";
import { officialProductUrl } from "@/lib/stores";
import { cn } from "@/lib/utils";
import type { SearchItem, StoreOffer } from "@/types/cartwise";

/*
  Detalle de producto con vista tipo tarjeta e-commerce: imagen protagonista
  sobre blanco y SOLO el nombre debajo (sin marca/categoría, como las fichas de
  supermercado online). Luego los precios por supermercado con enlace a la
  tienda oficial — la fila de la tienda más barata se resalta con fondo verde —
  y la acción de agregar a la compra pendiente. Los precios por tienda solo
  existen para productos exactos; los comparables muestran su mejor precio del
  snapshot sin desglose por tienda.
*/
export function ProductDetailDialog({
  item,
  onClose,
  onAddBasket,
}: {
  item: SearchItem | null;
  onClose: () => void;
  onAddBasket: (item: SearchItem) => void;
}) {
  const [offers, setOffers] = React.useState<StoreOffer[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setOffers(null);
    if (!item || item.kind !== "product") return;
    let active = true;
    setLoading(true);
    getProductOffers(item.id)
      .then((data) => {
        if (!active) return;
        setOffers((data.offers ?? []).filter((o) => o.precio != null && o.precio > 0));
      })
      .catch(() => active && setOffers([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [item]);

  const best = offers && offers.length ? Math.min(...offers.map((o) => o.precio ?? Infinity)) : null;

  return (
    <Dialog open={item !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        {item && (
          <>
            <div className="flex h-52 w-full items-center justify-center rounded-xl bg-white p-4">
              <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
            </div>

            <DialogHeader>
              <DialogTitle className="text-center text-lg font-bold leading-snug">
                {item.nombre}
              </DialogTitle>
            </DialogHeader>

            {/* En comparables por unidad no hay desglose por tienda: el mejor
                precio del snapshot se muestra aquí. */}
            {item.kind !== "product" && item.precio_min != null && (
              <p className="text-center">
                <span className="text-xs text-muted-foreground">Mejor precio </span>
                <span className="cw-price text-xl font-extrabold text-primary">
                  {money(item.precio_min)}
                </span>
                {item.precio_min_store_label && (
                  <span className="text-xs text-muted-foreground"> en {item.precio_min_store_label}</span>
                )}
              </p>
            )}

            {/* Precios por supermercado */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Precios por supermercado
              </p>
              {item.kind !== "product" ? (
                <p className="text-sm text-muted-foreground">
                  Comparable por unidad: el detalle por tienda se ve al comparar tu compra.
                </p>
              ) : loading ? (
                <p className="text-sm text-muted-foreground">Cargando precios…</p>
              ) : offers && offers.length ? (
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {offers
                    .slice()
                    .sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0))
                    .map((o) => {
                      const isBest = o.precio === best;
                      const officialUrl = officialProductUrl(o.url, o.store_label);
                      // Oferta temporal real de esa tienda: se muestra el precio
                      // original (lista) tachado junto al precio de oferta.
                      const esOferta =
                        Boolean(o.oferta_real) &&
                        o.precio_lista != null &&
                        o.precio_lista > (o.precio ?? 0);
                      return (
                        <li
                          key={o.store_id}
                          className={cn(
                            "flex items-center justify-between gap-2 px-3 py-2",
                            // La tienda más barata se resalta en verde.
                            isBest && "bg-primary/10 ring-1 ring-inset ring-primary/40",
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <StoreLogo name={o.store_label} size={36} />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {o.store_label}
                              </span>
                              {officialUrl && (
                                <a
                                  href={officialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                >
                                  <ExternalLink className="size-3.5" /> Ver en tienda oficial
                                </a>
                              )}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {esOferta ? (
                              <span className="flex flex-col items-end leading-tight">
                                <span className="flex items-baseline gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-savings">
                                    Oferta
                                  </span>
                                  <span
                                    className={cn(
                                      "cw-price font-bold",
                                      isBest ? "text-savings" : "text-foreground",
                                    )}
                                  >
                                    {money(o.precio)}
                                  </span>
                                </span>
                                <span className="cw-price text-xs font-semibold text-primary/60 line-through">
                                  {money(o.precio_lista)}
                                </span>
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "cw-price font-bold",
                                  isBest ? "text-savings" : "text-foreground",
                                )}
                              >
                                {money(o.precio)}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Sin precio disponible.</p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => {
                onAddBasket(item);
                onClose();
              }}
            >
              <Plus /> Agregar a compra pendiente
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
