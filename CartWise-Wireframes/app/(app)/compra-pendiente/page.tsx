"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  Scale,
  ShoppingBasket,
  AlertTriangle,
  RotateCcw,
  Search,
} from "lucide-react";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { useComparison } from "@/components/state/comparison-provider";
import { usePantry } from "@/components/state/pantry-provider";
import { ProductImage } from "@/components/product/product-image";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { money, plural } from "@/lib/format";
import { normalizeText } from "@/lib/text";
import type { BasketItem } from "@/types/cartwise";

export default function CompraPendientePage() {
  const {
    basket,
    basketUnits,
    updateQuantity,
    removeFromBasket,
    setBasket,
    clearBasket,
  } = usePendingPurchase();
  const { compareItems, comparing } = useComparison();
  const { pantry } = usePantry();

  // Eliminación temporal: el producto quitado queda en gris con opción de
  // restaurar. Se elimina definitivamente al salir de la página (estado local).
  const [removed, setRemoved] = useState<BasketItem[]>([]);

  const pantryNames = useMemo(
    () => new Set(pantry.map((p) => normalizeText(p.productName))),
    [pantry],
  );

  const estimatedMin = basket.reduce(
    (sum, item) => sum + (item.precio_min != null ? item.precio_min * item.quantity : 0),
    0,
  );
  const withoutPrice = basket.filter((i) => i.precio_min == null).length;

  const removeWithUndo = (item: BasketItem) => {
    removeFromBasket(item);
    setRemoved((prev) => [item, ...prev.filter((r) => !(r.id === item.id && r.kind === item.kind))]);
  };

  const restore = (item: BasketItem) => {
    setBasket([...basket, item]);
    setRemoved((prev) => prev.filter((r) => !(r.id === item.id && r.kind === item.kind)));
  };

  if (basket.length === 0 && removed.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Carrito" />
        <EmptyState
          icon={ShoppingBasket}
          title="Tu carrito está vacío"
          description="Busca productos y agrégalos para comparar supermercados."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Buscar productos
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Carrito"
        action={
          basket.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearBasket} className="text-destructive">
              <Trash2 /> Vaciar
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Líneas */}
        <div className="space-y-3">
          {basket.map((item) => {
            const inPantry = pantryNames.has(normalizeText(item.nombre));
            return (
              <BasketRow
                key={`${item.kind}-${item.id}`}
                item={item}
                inPantry={inPantry}
                onInc={() => updateQuantity(item, item.quantity + 1)}
                onDec={() => updateQuantity(item, item.quantity - 1)}
                onRemove={() => removeWithUndo(item)}
              />
            );
          })}

          {/* Eliminados temporalmente */}
          {removed.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Eliminados (puedes restaurarlos)
              </p>
              {removed.map((item) => (
                <Card key={`removed-${item.kind}-${item.id}`} className="border-dashed opacity-60">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="size-12 shrink-0 rounded-md bg-white p-1">
                      <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground line-through">
                      {item.nombre}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => restore(item)}>
                      <RotateCcw /> Restaurar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h3 className="text-lg font-extrabold text-foreground">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Productos</span>
                  <span className="font-semibold text-foreground">{basket.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidades</span>
                  <span className="font-semibold text-foreground">{basketUnits}</span>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Total desde mejor precio:</span>
                  <span className="cw-price text-xl font-extrabold text-primary">{money(estimatedMin)}</span>
                </div>
                {withoutPrice > 0 && (
                  <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="size-3.5" />
                    {plural(withoutPrice, "producto")} sin precio disponible
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={async () => {
                  // El carrito se reinicia al generar la comparación: sus
                  // productos pasan a vivir en la matriz de /comparar.
                  if (await compareItems(basket)) setBasket([]);
                }}
                disabled={comparing || basket.length === 0}
              >
                <Scale /> {comparing ? "Comparando…" : "Comparar supermercados"}
              </Button>
              <p className="text-xs text-muted-foreground">
                El total final depende de la tienda. La comparación prioriza cobertura y luego precio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BasketRow({
  item,
  inPantry,
  onInc,
  onDec,
  onRemove,
  onSwitch,
}: {
  item: BasketItem;
  inPantry: boolean;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
  onSwitch?: () => void;
}) {
  const lineTotal = item.precio_min != null ? item.precio_min * item.quantity : null;
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <div className="size-20 shrink-0 rounded-md bg-white p-1.5">
          <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground">{item.nombre}</h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {item.kind === "generic" && <Badge variant="muted">Comparable por unidad</Badge>}
                {item.marca && <span className="text-xs text-muted-foreground">{item.marca}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              aria-label={`Quitar ${item.nombre}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {inPantry && (
            <p className="inline-flex items-center gap-1.5 rounded-md bg-offer/15 px-2 py-1 text-xs font-semibold text-offer-foreground">
              <AlertTriangle className="size-3.5" /> Este producto ya está registrado en tu despensa
            </p>
          )}

          <div className="mt-1 flex items-center justify-between">
            <div className="inline-flex items-center rounded-lg border border-border">
              <button
                type="button"
                onClick={onDec}
                className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Disminuir cantidad"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={onInc}
                className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <div className="text-right">
              {lineTotal != null ? (
                <span className="cw-price text-base font-extrabold text-foreground">{money(lineTotal)}</span>
              ) : (
                <span className="text-sm font-semibold text-destructive">Sin precio</span>
              )}
              {item.precio_min_store_label && (
                <p className="text-xs text-muted-foreground">mejor en {item.precio_min_store_label}</p>
              )}
            </div>
          </div>

          {onSwitch && (
            <button
              type="button"
              onClick={onSwitch}
              className="self-start text-xs font-semibold text-primary hover:underline"
            >
              Cambiar por comparable por unidad
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
