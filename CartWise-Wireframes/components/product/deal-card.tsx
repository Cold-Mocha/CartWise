"use client";

import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLogo } from "@/components/brand/store-logo";
import { ProductImage } from "./product-image";
import { money } from "@/lib/format";
import { isStrongDifference } from "@/lib/basket";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Card de producto para grillas estáticas de ofertas/diferencias destacadas.
  Resalta la brecha de precio entre supermercados (no es una "oferta": es una
  diferencia). Acciones: "Añadir directo" y "Ver precios" (abre el detalle).
  Si el producto tiene URL oficial, ofrece "Ver en tienda oficial".
*/
export function DealCard({
  item,
  onAdd,
  onOpenDetail,
  className,
}: {
  item: SearchItem;
  onAdd?: (item: SearchItem) => void;
  onOpenDetail?: (item: SearchItem) => void;
  className?: string;
}) {
  const diff = item.diferencia ?? 0;
  const pct = item.precio_max ? Math.round((diff / item.precio_max) * 100) : 0;
  const strong = isStrongDifference(item);

  return (
    <div
      className={cn(
        "group flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-lg",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpenDetail ? () => onOpenDetail(item) : undefined}
        className="flex items-center gap-3 text-left"
        aria-label={`Ver detalle de ${item.nombre}`}
      >
        <div className="size-16 shrink-0 rounded-md bg-white p-1.5">
          <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
            {item.nombre}
          </h3>
        </div>
      </button>

      <div className="flex items-end justify-between border-t border-border pt-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Desde</p>
          <p className="cw-price text-lg font-extrabold text-foreground">{money(item.precio_min)}</p>
          {item.precio_min_store_label && (
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <StoreLogo name={item.precio_min_store_label} size={18} />
              {item.precio_min_store_label}
            </span>
          )}
        </div>
        {strong && diff > 0 && (
          <div className="text-right">
            <p className="cw-price text-base font-extrabold text-savings">-{money(diff)}</p>
            {pct > 0 && <p className="text-xs text-muted-foreground">{pct}% menos</p>}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          {onAdd && (
            <Button size="sm" className="flex-1" onClick={() => onAdd(item)}>
              <Plus /> Añadir
            </Button>
          )}
          {onOpenDetail && (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenDetail(item)}>
              Ver precios
            </Button>
          )}
        </div>
        {item.precio_min_url && (
          <a
            href={item.precio_min_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ExternalLink className="size-3" /> Ver en tienda oficial
          </a>
        )}
      </div>
    </div>
  );
}
