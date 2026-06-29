"use client";

import { Plus, Store, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-image";
import { money } from "@/lib/format";
import { isStrongDifference } from "@/lib/basket";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Card comercial de producto para el catálogo. Jerarquía: imagen → nombre →
  PRECIO destacado → tienda con mejor precio → tipo de coincidencia. El botón
  "Agregar" es la acción primaria. "Diferencia destacada" NO es una oferta: es
  una brecha de precio entre supermercados (plan §11).
*/
export function ProductCard({
  item,
  onAdd,
  className,
}: {
  item: SearchItem;
  onAdd: (item: SearchItem) => void;
  className?: string;
}) {
  const comparable = (item.n_tiendas ?? 0) >= 2;
  const strongDiff = isStrongDifference(item);
  const exact = item.kind === "product";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-square w-full bg-white p-4">
        <ProductImage ean={item.ean} alt={item.nombre} className="h-full w-full" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge variant={exact ? "default" : "muted"}>{exact ? "Exacto por EAN" : "Comparable"}</Badge>
          {strongDiff && (
            <Badge variant="savings" className="shadow-sm">
              <TrendingDown className="size-3" /> Diferencia destacada
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <div className="min-h-[2.5rem]">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{item.nombre}</h3>
          {item.marca && <p className="text-xs text-muted-foreground">{item.marca}</p>}
        </div>

        <div className="mt-auto space-y-1">
          {comparable && item.precio_min != null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="cw-price text-xl font-extrabold text-foreground">
                  {money(item.precio_min)}
                </span>
                {item.diferencia != null && item.diferencia > 0 && (
                  <span className="text-xs font-bold text-savings">
                    hasta -{money(item.diferencia)}
                  </span>
                )}
              </div>
              {item.precio_min_store_label && (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Store className="size-3" /> Mejor precio en{" "}
                  <span className="font-semibold text-foreground">{item.precio_min_store_label}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Aún sin comparación entre tiendas.</p>
          )}
        </div>

        <Button size="sm" className="mt-1 w-full" onClick={() => onAdd(item)}>
          <Plus /> Agregar
        </Button>
      </div>
    </article>
  );
}
