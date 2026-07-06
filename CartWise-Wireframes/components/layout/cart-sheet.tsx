"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductImage } from "@/components/product/product-image";
import { ProductPriceBlock } from "@/components/product/price-block";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { useComparison } from "@/components/state/comparison-provider";
import { money } from "@/lib/format";

/*
  Carrito lateral (estilo supermercado online): el botón "Carrito" del header
  abre este panel derecho con las líneas de la compra pendiente (cantidad,
  precio y quitar) y el paso siguiente del flujo: comparar supermercados. El
  detalle completo sigue viviendo en /compra-pendiente.
*/
export function CartSheet() {
  const { basket, basketUnits, updateQuantity, removeFromBasket, setBasket } =
    usePendingPurchase();
  const { compareItems, comparing } = useComparison();
  const [open, setOpen] = React.useState(false);

  const estimatedMin = basket.reduce(
    (sum, item) => sum + (item.precio_min != null ? item.precio_min * item.quantity : 0),
    0,
  );

  const handleCompare = async () => {
    // Navega a /comparar si la comparación funciona; el carrito se reinicia
    // porque sus productos ya viven en la comparación.
    if (await compareItems(basket)) setBasket([]);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={basketUnits > 0 ? "default" : "outline"}
          className="relative h-11 gap-2 px-4 transition-colors"
          aria-label="Abrir carrito"
        >
          <ShoppingCart className="size-4" />
          <span className="hidden sm:inline">Carrito</span>
          {basketUnits > 0 && (
            <Badge
              key={basketUnits}
              variant="savings"
              className="cw-pop ml-0.5 rounded-full bg-primary-foreground px-1.5 py-0 text-[11px] text-primary"
            >
              {basketUnits}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2.5 text-3xl">
            <ShoppingCart className="size-7" /> Carrito
          </SheetTitle>
        </SheetHeader>

        {basket.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <ShoppingCart className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Tu carrito está vacío. Busca productos y agrégalos para comparar supermercados.
            </p>
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link href="/productos">Buscar productos</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ul className="-mx-2 flex-1 space-y-1 overflow-y-auto px-2 py-2">
              {basket.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <div className="size-14 shrink-0 rounded-md border border-border bg-white p-1">
                    <ProductImage
                      ean={item.ean}
                      alt={item.nombre}
                      category={item.categoria}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                      {item.nombre}
                    </p>
                    {/* Precios de oferta / menor / mayor, arriba de los controles */}
                    <div className="mt-1.5">
                      <ProductPriceBlock item={item} compact />
                    </div>
                    <div className="mt-1.5 inline-flex items-center rounded-md border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromBasket(item)}
                    className="shrink-0 self-start text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Quitar ${item.nombre}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total desde mejor precio:</span>
                <span className="cw-price text-xl font-extrabold text-primary">
                  {money(estimatedMin)}
                </span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCompare} disabled={comparing}>
                {comparing ? (
                  "Comparando…"
                ) : (
                  <>
                    Comparar <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
