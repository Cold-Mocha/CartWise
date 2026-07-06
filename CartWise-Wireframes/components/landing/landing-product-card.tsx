"use client";

import Link from "next/link";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { ProductPriceBlock } from "@/components/product/price-block";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Tarjeta de producto de la landing. Usa el MISMO bloque de precios que las
  tarjetas de la app (ProductPriceBlock): OFERTA en verde savings con
  referencias tachadas en verde opaco, o "Menor precio" en verde con "Mayor
  precio" tachado en rojo. El badge circular de descuento aparece SOLO si la
  tienda más barata tiene una oferta temporal real (oferta_real del snapshot),
  nunca por la sola diferencia entre cadenas. "Mostrar precios" lleva al login:
  el detalle por tienda es de la app.
*/
export function LandingProductCard({ item, className }: { item: SearchItem; className?: string }) {
  const esOfertaTemporal = Boolean(item.oferta_real);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 pt-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
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

      <div className="flex h-28 w-full items-center justify-center rounded-lg bg-white p-2">
        <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
      </div>

      <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-foreground">
        {item.nombre}
      </h3>

      <div className="flex w-full flex-1 items-center justify-center">
        <ProductPriceBlock item={item} />
      </div>

      <Button asChild size="sm" className="mt-auto w-full">
        <Link href="/login">Mostrar precios</Link>
      </Button>
    </div>
  );
}
