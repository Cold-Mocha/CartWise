"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { DealsRow } from "@/components/product/browse-deals";
import { StoreDealsSection } from "@/components/product/store-deals";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getStrongDeals } from "@/lib/api";
import { sortImageFirst } from "@/lib/basket";
import { generalCategory } from "@/lib/categories";
import { currentMonthLabel } from "@/lib/format";
import type { SearchItem } from "@/types/cartwise";

export default function DashboardPage() {
  const { addToBasket } = usePendingPurchase();

  const [deals, setDeals] = useState<SearchItem[] | null>(null);
  const [detail, setDetail] = useState<SearchItem | null>(null);

  useEffect(() => {
    let active = true;
    getStrongDeals(120)
      .then(
        (items) =>
          active &&
          setDeals(sortImageFirst(items.filter((i) => generalCategory(i.categoria))).slice(0, 15)),
      )
      .catch(() => active && setDeals([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="h-0.5 w-8 rounded bg-primary/60" />
          Tu mes en comida
        </p>
        <h1 className="text-3xl font-extrabold capitalize tracking-tight text-foreground sm:text-4xl">
          {currentMonthLabel()}
        </h1>
      </div>

      {/* Diferencias destacadas (grilla estática) */}
      <section className="space-y-4">
        <SectionHeading title="Diferencias destacadas" />
        {!deals ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-[45%] shrink-0 rounded-xl sm:w-[31%] lg:w-[19%]" />
            ))}
          </div>
        ) : deals.length ? (
          <DealsRow items={deals} onAdd={addToBasket} onOpenDetail={setDetail} />
        ) : (
          <EmptyState
            icon={Tag}
            title="Sin diferencias destacadas en este snapshot"
            description="Vuelve a intentarlo más tarde."
          />
        )}
      </section>

      {/* Ofertas reales: título general y una sección por supermercado (logo + nombre) */}
      <section className="space-y-6">
        <SectionHeading title="Mejores precios y ofertas en cada supermercado" />
        <StoreDealsSection onAdd={addToBasket} onOpenDetail={setDetail} />
      </section>

      <ProductDetailDialog item={detail} onClose={() => setDetail(null)} onAddBasket={addToBasket} />
    </div>
  );
}
