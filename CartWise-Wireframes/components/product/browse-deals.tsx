"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sortImageFirst } from "@/lib/basket";
import { generalCategory, GENERAL_CATEGORY_ORDER, type GeneralCategory } from "@/lib/categories";
import type { SearchItem } from "@/types/cartwise";

/*
  Vista del catálogo sin búsqueda activa: diferencias destacadas reales agrupadas
  en categorías GENERALES, en grillas estáticas (sin carrusel automático). No
  inventa productos: todo viene del mart (la página dueña hace el fetch). El
  alcohol se excluye del flujo principal y los productos sin foto quedan fuera
  de la vitrina (siguen existiendo en el mart y en la búsqueda). `matches`
  aplica los filtros del panel lateral también en este modo exploración; con
  filtros activos basta 1 producto para mostrar la categoría (sin filtros se
  exigen 3 para que la grilla respire).
*/

const PER_CATEGORY = 8; // dos filas en lg (4 columnas)

export function BrowseDeals({
  deals,
  error,
  matches,
  onAdd,
  onOpenDetail,
}: {
  deals: SearchItem[] | null;
  error: boolean;
  matches?: (item: SearchItem) => boolean;
  onAdd: (item: SearchItem) => void;
  onOpenDetail: (item: SearchItem) => void;
}) {
  const groups = useMemo(() => {
    if (!deals) return [];
    const minPerGroup = matches ? 1 : 3;
    const map = new Map<GeneralCategory, SearchItem[]>();
    for (const item of sortImageFirst(deals)) {
      if (!item.ean) continue; // sin foto: fuera de la vitrina
      if (matches && !matches(item)) continue;
      const g = generalCategory(item.categoria);
      if (!g) continue; // alcohol u otros excluidos
      const list = map.get(g) ?? [];
      if (list.length < PER_CATEGORY) list.push(item);
      map.set(g, list);
    }
    return GENERAL_CATEGORY_ORDER.filter((g) => (map.get(g)?.length ?? 0) >= minPerGroup).map((g) => ({
      category: g,
      items: map.get(g)!,
    }));
  }, [deals, matches]);

  if (error) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        No se pudieron cargar los productos destacados. Verifica que la base del Scrapper esté disponible.
      </p>
    );
  }

  if (!deals) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.category} className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{group.category}</h2>
          <DealsGrid items={group.items} onAdd={onAdd} onOpenDetail={onOpenDetail} />
        </section>
      ))}

      {groups.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          {matches
            ? "Ningún producto destacado coincide con los filtros. Ajusta o limpia los filtros."
            : "No hay diferencias destacadas en este snapshot."}
        </p>
      )}
    </div>
  );
}

/*
  Fila horizontal desplazable con flechas: una sola fila de productos que el
  usuario recorre con los botones prev/next (o arrastrando). Se usa en el
  dashboard para mostrar varias diferencias destacadas sin ocupar dos filas.
*/
export function DealsRow({
  items,
  onAdd,
  onOpenDetail,
}: {
  items: SearchItem[];
  onAdd: (item: SearchItem) => void;
  onOpenDetail: (item: SearchItem) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="-mx-3 -mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-3 pb-2 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={`${item.kind}-${item.id}`}
            className="w-[45%] shrink-0 snap-start sm:w-[31%] lg:w-[19%]"
          >
            <ProductCard item={item} onAdd={onAdd} onOpenDetail={onOpenDetail} className="h-full" />
          </div>
        ))}
      </div>

      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Ver anteriores"
        onClick={() => scrollBy(-1)}
        className="absolute -left-6 top-1/2 hidden -translate-y-1/2 rounded-full bg-card shadow-md sm:inline-flex"
      >
        <ChevronLeft />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Ver siguientes"
        onClick={() => scrollBy(1)}
        className="absolute -right-6 top-1/2 hidden -translate-y-1/2 rounded-full bg-card shadow-md sm:inline-flex"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

export function DealsGrid({
  items,
  onAdd,
  onOpenDetail,
}: {
  items: SearchItem[];
  onAdd: (item: SearchItem) => void;
  onOpenDetail: (item: SearchItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ProductCard
          key={`${item.kind}-${item.id}`}
          item={item}
          onAdd={onAdd}
          onOpenDetail={onOpenDetail}
          className="h-full"
        />
      ))}
    </div>
  );
}
