"use client";

import Link from "next/link";
import { History, BadgeCheck, Search } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { money, shortDate, plural } from "@/lib/format";

export default function HistorialPage() {
  const { confirmed } = useAppState();

  const purchases = [...confirmed].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Historial de compras"
        description="Tus compras confirmadas. Aquí solo aparecen las compras que ya realizaste."
      />

      {purchases.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tu historial está vacío"
          description="Cuando confirmes una compra aparecerá aquí. Los planes que aún no compras viven en Compras planificadas."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Empezar una compra
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex min-w-[160px] flex-1 items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-savings/12 text-savings">
                    <BadgeCheck className="size-4" />
                  </span>
                  <div>
                    <p className="text-base font-extrabold text-foreground">{purchase.store}</p>
                    <p className="text-xs text-muted-foreground">
                      {shortDate(purchase.purchaseDate)} · {plural(purchase.items.length, "producto")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total pagado</p>
                  <p className="cw-price text-lg font-extrabold text-foreground">{money(purchase.realTotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ahorro</p>
                  <p className="cw-price text-sm font-bold text-savings">
                    {money(purchase.confirmedSavings ?? purchase.estimatedSavings ?? 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
