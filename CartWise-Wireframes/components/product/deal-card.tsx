"use client";

import { ArrowRight, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "./product-image";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Card compacta para carruseles de "diferencias destacadas". Resalta la brecha
  de precio entre supermercados. No la llamamos "oferta": es una diferencia
  (plan §11). Opcionalmente clicable para agregar.
*/
export function DealCard({
  item,
  onClick,
  className,
}: {
  item: SearchItem;
  onClick?: (item: SearchItem) => void;
  className?: string;
}) {
  const diff = item.diferencia ?? 0;
  const pct = item.precio_max ? Math.round((diff / item.precio_max) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(item) : undefined}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-lg",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 rounded-md bg-white p-1.5">
          <ProductImage ean={item.ean} alt={item.nombre} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge variant="savings" className="mb-1">
            <TrendingDown className="size-3" /> Diferencia destacada
          </Badge>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{item.nombre}</h3>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-border pt-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Desde</p>
          <p className="cw-price text-lg font-extrabold text-foreground">{money(item.precio_min)}</p>
          {item.precio_min_store_label && (
            <p className="text-xs text-muted-foreground">en {item.precio_min_store_label}</p>
          )}
        </div>
        <div className="text-right">
          <p className="cw-price text-base font-extrabold text-savings">-{money(diff)}</p>
          {pct > 0 && <p className="text-xs text-muted-foreground">{pct}% más barato</p>}
        </div>
      </div>

      {onClick && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Ver precios y agregar <ArrowRight className="size-3" />
        </span>
      )}
    </button>
  );
}
