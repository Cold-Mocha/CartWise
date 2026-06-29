"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Carousel, CarouselSlide } from "@/components/ui/carousel";
import { DealCard } from "@/components/product/deal-card";
import { SectionHeading } from "@/components/common/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { getDealsByCategory } from "@/lib/api";
import { normalizeText } from "@/lib/text";
import type { CategoryDeals, SearchItem } from "@/types/cartwise";

/*
  Experiencia tipo supermercado cuando no hay búsqueda activa (plan §5): un
  carrusel personalizado según el historial + carruseles por categoría con
  productos reales del backend. Al tocar una card se abre el detalle (precios por
  tienda + agregar a compra/despensa). No inventa productos: todo viene del mart.
*/
export function BrowseCarousels({
  purchasedCategories,
  onOpenDetail,
}: {
  purchasedCategories: string[];
  onOpenDetail: (item: SearchItem) => void;
}) {
  const [groups, setGroups] = useState<CategoryDeals[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDealsByCategory(10, 8)
      .then((g) => active && setGroups(g))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        No se pudieron cargar los productos destacados. Verifica que la base del Scrapper esté disponible.
      </p>
    );
  }

  if (!groups) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-64" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-44 w-[clamp(220px,80vw,280px)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const purchasedSet = new Set(purchasedCategories.map(normalizeText));
  const personalized = groups
    .filter((g) => purchasedSet.has(normalizeText(g.categoria)))
    .flatMap((g) => g.items)
    .slice(0, 12);

  return (
    <div className="space-y-10">
      {/* Carrusel personalizado por historial */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Para ti"
          title="Diferencias destacadas en lo que ya compraste"
          description={
            personalized.length
              ? "Según las categorías de tus compras confirmadas."
              : "Aún no tienes compras confirmadas. Mientras tanto, mira las mayores diferencias del momento."
          }
        />
        <CarouselRow
          items={personalized.length ? personalized : groups.flatMap((g) => g.items).slice(0, 12)}
          ariaLabel="Diferencias destacadas para ti"
          onOpenDetail={onOpenDetail}
        />
      </section>

      {/* Carruseles por categoría real */}
      {groups.map((group) => (
        <section key={group.categoria} className="space-y-4">
          <SectionHeading
            eyebrow="Mejores diferencias"
            title={group.categoria}
            description="Las mayores brechas de precio entre supermercados en esta categoría."
          />
          <CarouselRow
            items={group.items}
            ariaLabel={`Mejores diferencias en ${group.categoria}`}
            onOpenDetail={onOpenDetail}
          />
        </section>
      ))}

      {groups.length === 0 && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          No hay diferencias destacadas en este snapshot.
        </p>
      )}
    </div>
  );
}

function CarouselRow({
  items,
  ariaLabel,
  onOpenDetail,
}: {
  items: SearchItem[];
  ariaLabel: string;
  onOpenDetail: (item: SearchItem) => void;
}) {
  if (!items.length) return null;
  return (
    <Carousel autoplay ariaLabel={ariaLabel}>
      {items.map((item) => (
        <CarouselSlide key={`${item.kind}-${item.id}`} className="w-[clamp(230px,80vw,280px)]">
          <DealCard item={item} onClick={onOpenDetail} className="h-full" />
        </CarouselSlide>
      ))}
    </Carousel>
  );
}
