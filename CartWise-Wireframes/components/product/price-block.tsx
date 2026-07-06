import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Bloque de precios compartido por TODAS las tarjetas de producto (app y
  landing), para que la anatomía sea idéntica. Dos variantes según oferta_real:
  - Oferta temporal: la cifra grande es la OFERTA (verde savings); el precio de
    lista de la tienda va tachado en verde OPACO para que la oferta destaque
    (rotulado "Precio normal" en ofertas por supermercado, "Menor precio" en
    comparaciones entre cadenas) y "Mayor precio" tachado en rojo.
  - Normal: "Menor precio" grande en verde primary y "Mayor precio" (o "Precio
    lista") tachado en rojo como indicador de diferencia entre cadenas.
  `compact` reduce la tipografía y alinea a la izquierda para espacios angostos
  (líneas del carrito lateral).
*/
export function ProductPriceBlock({ item, compact = false }: { item: SearchItem; compact?: boolean }) {
  const esOfertaTemporal = Boolean(item.oferta_real);
  // En las ofertas por supermercado (storeDeals) no hay comparación entre
  // cadenas: el precio de lista es simplemente el precio normal de esa tienda.
  const esOfertaDeTienda = item.match_label === "Oferta en tienda";
  // Cifra tachada: el mayor precio entre cadenas o, si no existe (ofertas por
  // tienda), el precio de lista de la misma cadena.
  const mayorPrecio =
    item.precio_max != null && item.precio_max > (item.precio_min ?? 0) ? item.precio_max : null;
  const precioLista =
    item.precio_lista != null && item.precio_lista > (item.precio_min ?? 0) ? item.precio_lista : null;
  const tachado = mayorPrecio ?? precioLista;
  const tachadoLabel = mayorPrecio != null ? "Mayor precio" : "Precio lista";

  if (item.precio_min == null) {
    return <p className="text-xs text-muted-foreground">Sin precio disponible.</p>;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-1",
        compact ? "justify-start gap-x-2.5" : "justify-center gap-x-3",
      )}
    >
      {esOfertaTemporal ? (
        <>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wide text-savings">
              Oferta
            </span>
            <span className={cn("cw-price font-extrabold text-savings", compact ? "text-lg" : "text-2xl")}>
              {money(item.precio_min)}
            </span>
          </div>
          {precioLista != null && (
            <RefPrice
              label={esOfertaDeTienda ? "Precio normal" : "Menor precio"}
              value={precioLista}
              muted
              compact={compact}
            />
          )}
          {mayorPrecio != null && <RefPrice label="Mayor precio" value={mayorPrecio} compact={compact} />}
        </>
      ) : (
        <>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Menor precio
            </span>
            <span className={cn("cw-price font-extrabold text-primary", compact ? "text-lg" : "text-xl")}>
              {money(item.precio_min)}
            </span>
          </div>
          {tachado != null && <RefPrice label={tachadoLabel} value={tachado} compact={compact} />}
        </>
      )}
    </div>
  );
}

function RefPrice({
  label,
  value,
  muted = false,
  compact = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "cw-price font-semibold line-through",
          compact ? "text-xs" : "text-sm",
          muted ? "text-primary/60" : "text-red-600",
        )}
      >
        {money(value)}
      </span>
    </div>
  );
}
