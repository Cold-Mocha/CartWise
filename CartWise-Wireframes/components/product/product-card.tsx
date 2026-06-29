"use client";

import { Plus, Store, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-image";
import { StorePricesPopover } from "./store-prices-popover";
import { money } from "@/lib/format";
import { isStrongDifference, strongDifferencePct } from "@/lib/basket";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Card comercial de producto para el catálogo, estilo supermercado online.
  Jerarquía: imagen → nombre → categoría/marca → PRECIO destacado → tienda con
  mejor precio. El botón "Agregar" es la acción primaria; al pasar el cursor por
  la imagen se ven los precios por supermercado (plan §4.5/§4.6). "Diferencia
  destacada" NO es una oferta: es una brecha de precio entre tiendas >=20%.
*/
export function ProductCard({
  item,
  onAdd,
  onOpenDetail,
  tags = [],
  className,
}: {
  item: SearchItem;
  onAdd: (item: SearchItem) => void;
  onOpenDetail?: (item: SearchItem) => void;
  tags?: string[];
  className?: string;
}) {
  const comparable = (item.n_tiendas ?? 0) >= 2;
  const strongDiff = isStrongDifference(item);
  const pct = strongDifferencePct(item);

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        className,
      )}
    >
      <StorePricesPopover item={item}>
        <button
          type="button"
          onClick={onOpenDetail ? () => onOpenDetail(item) : undefined}
          className="relative block aspect-square w-full overflow-hidden rounded-t-lg bg-white p-4"
          aria-label={`Ver detalle de ${item.nombre}`}
        >
          <ProductImage ean={item.ean} alt={item.nombre} className="h-full w-full" />
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {strongDiff && (
              <Badge variant="savings" className="shadow-sm">
                <TrendingDown className="size-3" /> Destacado{pct ? ` -${Math.round(pct * 100)}%` : ""}
              </Badge>
            )}
            {tags.map((tag) => (
              <Badge key={tag} variant="muted" className="shadow-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </button>
      </StorePricesPopover>

      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <div className="min-h-[3.1rem]">
          <button
            type="button"
            onClick={onOpenDetail ? () => onOpenDetail(item) : undefined}
            className="block text-left"
          >
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground hover:text-primary">
              {item.nombre}
            </h3>
          </button>
          <p className="truncate text-xs text-muted-foreground">
            {[item.marca, item.categoria].filter(Boolean).join(" · ") || "Producto"}
          </p>
        </div>

        <div className="mt-auto space-y-1">
          {comparable && item.precio_min != null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="cw-price text-xl font-extrabold text-foreground">
                  {money(item.precio_min)}
                </span>
                {strongDiff && item.diferencia != null && item.diferencia > 0 && (
                  <span className="text-xs font-bold text-savings">hasta -{money(item.diferencia)}</span>
                )}
              </div>
              {item.precio_min_store_label && (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Store className="size-3" /> Más barato en{" "}
                  <span className="font-semibold text-foreground">{item.precio_min_store_label}</span>
                </p>
              )}
            </>
          ) : item.precio_min != null ? (
            <div className="flex items-baseline gap-2">
              <span className="cw-price text-xl font-extrabold text-foreground">
                {money(item.precio_min)}
              </span>
              <span className="text-xs text-muted-foreground">en una tienda</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Sin precio en el último snapshot.</p>
          )}
        </div>

        <Button size="sm" className="mt-1 w-full" onClick={() => onAdd(item)}>
          <Plus /> Agregar
        </Button>
      </div>
    </article>
  );
}
