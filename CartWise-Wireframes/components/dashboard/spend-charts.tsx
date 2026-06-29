"use client";

import { BarChart3, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { money } from "@/lib/format";
import type { ConfirmedPurchase } from "@/types/cartwise";

// Reparte el total de una compra entre las categorías de sus ítems. Usa
// paidPrice si existe; si no, distribuye el total real por cantidad. El gasto
// por categoría es, por eso, una estimación (se rotula como tal).
function categorySpend(purchases: ConfirmedPurchase[]) {
  const totals = new Map<string, number>();
  for (const p of purchases) {
    const qtyTotal = p.items.reduce((s, it) => s + it.quantity, 0) || 1;
    for (const it of p.items) {
      const cat = it.category?.trim() || "Otros";
      const amount =
        it.paidPrice != null ? it.paidPrice * it.quantity : (p.realTotal * it.quantity) / qtyTotal;
      totals.set(cat, (totals.get(cat) ?? 0) + amount);
    }
  }
  return [...totals.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

// Gasto acumulado del mes por día de compra.
function cumulativeByDay(purchases: ConfirmedPurchase[]) {
  const sorted = [...purchases].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
  let running = 0;
  return sorted.map((p) => {
    running += p.realTotal;
    return { date: p.purchaseDate.slice(5), value: running };
  });
}

export function CategorySpendChart({ purchases }: { purchases: ConfirmedPurchase[] }) {
  const data = categorySpend(purchases).slice(0, 6);
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-4 text-primary" /> Gasto por categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Sin gasto registrado"
            description="Confirma una compra para ver en qué categorías gastas más."
          />
        ) : (
          <ul className="space-y-3">
            {data.map((d) => (
              <li key={d.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{d.category}</span>
                  <span className="cw-price text-muted-foreground">{money(Math.round(d.total))}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(6, (d.total / max) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
            <li className="pt-1 text-xs text-muted-foreground">Estimación a partir de tus compras confirmadas.</li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyAccumChart({ purchases }: { purchases: ConfirmedPurchase[] }) {
  const data = cumulativeByDay(purchases);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChart className="size-4 text-primary" /> Gasto acumulado del mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={LineChart}
            title="Sin compras este mes"
            description="Cuando confirmes compras, verás cómo se acumula tu gasto del mes."
          />
        ) : (
          <div className="flex h-44 items-end gap-2">
            {data.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary"
                    style={{ height: `${Math.max(8, (d.value / max) * 100)}%` }}
                    title={money(d.value)}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{d.date}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
