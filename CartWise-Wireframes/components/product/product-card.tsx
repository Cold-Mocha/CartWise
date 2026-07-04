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
  Card comercial de producto para el catálogo, estilo supermercado online.
  Jerarquía: imagen → nombre → categoría/marca → PRECIO destacado → tienda con
  mejor precio. Dos acciones: "Añadir directo" (agrega de inmediato) y "Ver
  precios y agregar" (abre el detalle con precios por tienda). Los precios NO se
  muestran al pasar el cursor: solo al abrir el detalle.
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

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpenDetail ? () => onOpenDetail(item) : undefined}
        className="relative block aspect-square w-full overflow-hidden rounded-t-lg bg-white p-4"
        aria-label={`Ver detalle de ${item.nombre}`}
      >
        <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {strongDiff && (
            <Badge variant="savings" className="shadow-sm">
              <TrendingDown className="size-3" /> Destacado
            </Badge>
          )}
          {tags.map((tag) => (
            <Badge key={tag} variant="muted" className="shadow-sm">
              {tag}
            </Badge>
          ))}
        </div>
      </button>

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
            <p className="text-xs text-muted-foreground">Sin precio disponible.</p>
          )}
        </div>

        <div className="mt-1 flex gap-1.5">
          <Button size="sm" className="flex-1" onClick={() => onAdd(item)}>
            <Plus /> Añadir directo
          </Button>
          {onOpenDetail && (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenDetail(item)}>
              Ver precios
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
