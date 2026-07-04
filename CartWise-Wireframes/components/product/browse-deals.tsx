"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DealCard } from "@/components/product/deal-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStrongDeals } from "@/lib/api";
import { generalCategory, GENERAL_CATEGORY_ORDER, type GeneralCategory } from "@/lib/categories";
import type { SearchItem } from "@/types/cartwise";

/*
  Vista del catálogo sin búsqueda activa: diferencias destacadas reales agrupadas
  en categorías GENERALES, en grillas estáticas de dos filas (sin carrusel
  automático). Si el usuario tiene historial, se muestra primero una sección con
  productos de las categorías que ya compró. No inventa productos: todo viene del
  mart. El alcohol se excluye del flujo principal.
*/

const PER_CATEGORY = 10; // dos filas en lg (5 columnas)

export function BrowseDeals({
  purchasedCategories,
  onAdd,
  onOpenDetail,
}: {
  purchasedCategories: string[];
  onAdd: (item: SearchItem) => void;
  onOpenDetail: (item: SearchItem) => void;
}) {
  const [deals, setDeals] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getStrongDeals(400)
      .then((items) => active && setDeals(items))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => {
    if (!deals) return [];
    const map = new Map<GeneralCategory, SearchItem[]>();
    for (const item of deals) {
      const g = generalCategory(item.categoria);
      if (!g) continue; // alcohol u otros excluidos
      const list = map.get(g) ?? [];
      if (list.length < PER_CATEGORY) list.push(item);
      map.set(g, list);
    }
    return GENERAL_CATEGORY_ORDER.filter((g) => (map.get(g)?.length ?? 0) >= 3).map((g) => ({
      category: g,
      items: map.get(g)!,
    }));
  }, [deals]);

  const personalized = useMemo(() => {
    if (!deals || !purchasedCategories.length) return [];
    const purchasedGenerals = new Set(
      purchasedCategories.map((c) => generalCategory(c)).filter(Boolean) as GeneralCategory[],
    );
    if (!purchasedGenerals.size) return [];
    return deals.filter((d) => {
      const g = generalCategory(d.categoria);
      return g && purchasedGenerals.has(g);
    }).slice(0, PER_CATEGORY);
  }, [deals, purchasedCategories]);

  if (error) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-56 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Sección personalizada: solo si hay historial relevante */}
      {personalized.length >= 3 && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Diferencias en lo que ya compraste
          </h2>
          <DealsGrid items={personalized} onAdd={onAdd} onOpenDetail={onOpenDetail} />
        </section>
      )}

      {groups.map((group) => (
        <section key={group.category} className="space-y-3">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">{group.category}</h2>
          <DealsGrid items={group.items} onAdd={onAdd} onOpenDetail={onOpenDetail} />
        </section>
      ))}

      {groups.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No hay diferencias destacadas en este snapshot.
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
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={`${item.kind}-${item.id}`}
            className="w-[45%] shrink-0 snap-start sm:w-[31%] lg:w-[19%]"
          >
            <DealCard item={item} onAdd={onAdd} onOpenDetail={onOpenDetail} className="h-full" />
          </div>
        ))}
      </div>

      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Ver anteriores"
        onClick={() => scrollBy(-1)}
        className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-card shadow-md sm:inline-flex"
      >
        <ChevronLeft />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Ver siguientes"
        onClick={() => scrollBy(1)}
        className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-card shadow-md sm:inline-flex"
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <DealCard
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
