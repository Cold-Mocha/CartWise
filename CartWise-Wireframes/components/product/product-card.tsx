"use client";

import { Percent, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-image";
import { ProductPriceBlock } from "./price-block";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Tarjeta de producto de la app con la anatomía de la guía /style (la misma de
  la landing): imagen centrada sobre blanco, nombre en dos líneas, bloque de
  precios compartido (ProductPriceBlock), badge circular de % SOLO con oferta
  temporal real (oferta_real) y botón verde de ancho completo. La imagen y el
  nombre abren el detalle con los precios por tienda; el botón agrega a la
  compra pendiente.
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
  const openDetail = onOpenDetail ? () => onOpenDetail(item) : undefined;
  const esOfertaTemporal = Boolean(item.oferta_real);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 pt-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      {esOfertaTemporal && (
        <span
          className="absolute -right-2.5 -top-2.5 z-10 flex size-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md"
          title="Oferta temporal en la tienda más barata"
        >
          <Percent className="size-4" />
        </span>
      )}

      {tags.length > 0 && (
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="muted" className="shadow-sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={openDetail}
        className="flex h-28 w-full items-center justify-center rounded-lg bg-white p-2"
        aria-label={`Ver detalle de ${item.nombre}`}
      >
        <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
      </button>

      <button type="button" onClick={openDetail} className="block w-full">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {item.nombre}
        </h3>
      </button>

      {/* Centrado verticalmente en el espacio libre entre nombre y botones,
          para que las tarjetas de una misma fila queden parejas. */}
      <div className="flex w-full flex-1 items-center justify-center">
        <ProductPriceBlock item={item} />
      </div>

      <div className="mt-auto w-full space-y-1.5 pt-1">
        <Button size="sm" className="w-full" onClick={() => onAdd(item)}>
          <Plus /> Agregar a la compra
        </Button>
        {onOpenDetail && (
          <Button size="sm" variant="outline" className="w-full" onClick={openDetail}>
            Ver precios
          </Button>
        )}
      </div>
    </article>
  );
}
