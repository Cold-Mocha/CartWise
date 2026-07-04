"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBasket, Tag, ArrowRight, Scale } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { DealsRow } from "@/components/product/browse-deals";
import { StoreDealsSection } from "@/components/product/store-deals";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStrongDeals } from "@/lib/api";
import { generalCategory } from "@/lib/categories";
import { monthKey, currentMonthLabel, plural } from "@/lib/format";
import type { SearchItem } from "@/types/cartwise";

export default function DashboardPage() {
  const { hydrated, basket, basketUnits, confirmed, compareItems, addToBasket, monthlyBudget } =
    useAppState();

  const month = monthKey();
  const gastoMes = confirmed
    .filter((c) => monthKey(c.purchaseDate) === month)
    .reduce((s, c) => s + (c.realTotal || 0), 0);

  const [deals, setDeals] = useState<SearchItem[] | null>(null);
  const [detail, setDetail] = useState<SearchItem | null>(null);

  useEffect(() => {
    let active = true;
    getStrongDeals(120)
      .then((items) => active && setDeals(items.filter((i) => generalCategory(i.categoria)).slice(0, 15)))
      .catch(() => active && setDeals([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Tu mes en comida</p>
        <h1 className="text-3xl font-extrabold capitalize tracking-tight text-foreground sm:text-4xl">
          {currentMonthLabel()}
        </h1>
      </div>

      {/* Dos tarjetas principales: Presupuesto y Compra pendiente */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BudgetProgress spent={hydrated ? gastoMes : 0} budget={monthlyBudget} />

        {basket.length > 0 ? (
          <Card className="cw-pulse border-2 border-primary bg-primary/5">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-primary">
                  <ShoppingBasket className="size-4" /> Compra pendiente
                </p>
                <p className="mt-2 text-3xl font-extrabold text-foreground">
                  {plural(basket.length, "producto")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {plural(basketUnits, "unidad", "unidades")} lista para comparar
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href="/compra-pendiente">Ver compra</Link>
                </Button>
                <Button onClick={() => compareItems(basket)}>
                  <Scale /> Comparar supermercados
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex h-full flex-col items-start justify-center gap-2 p-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <ShoppingBasket className="size-4" /> Compra pendiente
              </p>
              <p className="text-2xl font-extrabold text-foreground">Aún vacía</p>
              <p className="text-sm text-muted-foreground">
                Busca productos y agrégalos para comparar supermercados.
              </p>
              <Button asChild className="mt-1">
                <Link href="/productos">
                  Buscar productos <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diferencias destacadas (grilla estática) */}
      <section className="space-y-4">
        <SectionHeading
          title="Diferencias destacadas"
          description="Las mayores brechas de precio entre supermercados (20% o más). Toca una para agregarla a tu compra."
        />
        {!deals ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-[45%] shrink-0 rounded-lg sm:w-[31%] lg:w-[19%]" />
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

      {/* Ofertas reales por supermercado (grilla 2x2) */}
      <section className="space-y-4">
        <SectionHeading
          title="Ofertas por supermercado"
          description="Las mejores promociones reales de cada cadena: precio rebajado sobre su precio de lista."
        />
        <StoreDealsSection onOpenDetail={setDetail} />
      </section>

      <ProductDetailDialog item={detail} onClose={() => setDetail(null)} onAddBasket={addToBasket} />
    </div>
  );
}
