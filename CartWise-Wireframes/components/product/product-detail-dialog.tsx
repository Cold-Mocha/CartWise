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
import { Badge } from "@/components/ui/badge";
import { StoreLogo } from "@/components/brand/store-logo";
import { ProductImage } from "./product-image";
import { getProductOffers } from "@/lib/api";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SearchItem, StoreOffer } from "@/types/cartwise";

/*
  Detalle de producto: foto (o ícono referencial por categoría), nombre, marca,
  categoría, precios por supermercado con enlace a la tienda oficial, mejor
  precio y acción de agregar a la compra pendiente. Los precios por tienda solo
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
            <DialogHeader>
              <DialogTitle className="pr-6 text-left text-base leading-snug">{item.nombre}</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4">
              <div className="size-28 shrink-0 rounded-lg border border-border bg-white p-2">
                <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
              </div>
              <div className="min-w-0 space-y-1.5">
                {item.marca && <p className="text-sm font-semibold text-foreground">{item.marca}</p>}
                {item.categoria && (
                  <Badge variant="muted" className="font-medium">
                    {item.categoria}
                  </Badge>
                )}
                {item.precio_min != null && (
                  <p className="pt-1">
                    <span className="text-xs text-muted-foreground">Mejor precio </span>
                    <span className="cw-price text-xl font-extrabold text-foreground">
                      {money(item.precio_min)}
                    </span>
                    {item.precio_min_store_label && (
                      <span className="text-xs text-muted-foreground"> en {item.precio_min_store_label}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

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
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {offers
                    .slice()
                    .sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0))
                    .map((o) => {
                      const isBest = o.precio === best;
                      return (
                        <li key={o.store_id} className="flex items-center justify-between gap-2 px-3 py-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <StoreLogo name={o.store_label} size={24} />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {o.store_label}
                              </span>
                              {o.url && (
                                <a
                                  href={o.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                >
                                  <ExternalLink className="size-3" /> Ver en tienda oficial
                                </a>
                              )}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {isBest && <Badge variant="savings">Mejor precio</Badge>}
                            <span
                              className={cn(
                                "cw-price font-bold",
                                isBest ? "text-savings" : "text-foreground",
                              )}
                            >
                              {money(o.precio)}
                            </span>
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
