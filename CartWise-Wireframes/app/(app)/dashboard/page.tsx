"use client";

import Link from "next/link";
import {
  Wallet,
  PiggyBank,
  ShoppingBasket,
  Bookmark,
  History,
  Tag,
  ArrowRight,
  Scale,
} from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { CategorySpendChart, MonthlyAccumChart } from "@/components/dashboard/spend-charts";
import { DealsCarousel } from "@/components/landing/deals-carousel";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { money, monthKey, currentMonthLabel, plural, shortDate } from "@/lib/format";

export default function DashboardPage() {
  const {
    hydrated,
    basket,
    basketUnits,
    history,
    confirmed,
    savedLists,
    pantry,
    compareItems,
    addToBasket,
    monthlyBudget,
  } = useAppState();

  const month = monthKey();
  const monthConfirmed = confirmed.filter((c) => monthKey(c.purchaseDate) === month);
  const gastoMes = monthConfirmed.reduce((s, c) => s + (c.realTotal || 0), 0);
  const monthPlans = history.filter((p) => monthKey(p.createdAt) === month);
  const ahorroEstimado = monthPlans.reduce((s, p) => s + (p.savings || 0), 0);
  const recientes = [...confirmed].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const pantryUnits = pantry.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="space-y-10">
      {/* Encabezado centrado en el usuario (sin estado del sistema) */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Tu mes en comida</p>
        <h1 className="text-3xl font-extrabold capitalize tracking-tight text-foreground sm:text-4xl">
          {currentMonthLabel()}
        </h1>
      </div>

      {/* Métricas del mes */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Wallet}
          label="Gasto registrado del mes"
          value={hydrated ? money(gastoMes) : "—"}
          hint="Según tus compras confirmadas"
        />
        <MetricCard
          icon={PiggyBank}
          label="Ahorro estimado"
          value={hydrated ? money(ahorroEstimado) : "—"}
          hint="Según planes comparados"
          tone="savings"
        />
        <MetricCard
          icon={ShoppingBasket}
          label="Compra pendiente"
          value={hydrated ? plural(basketUnits, "producto") : "—"}
          hint={basket.length ? "Lista para comparar" : "Aún vacía"}
        />
      </div>

      {/* Presupuesto del mes + compra pendiente */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BudgetProgress spent={gastoMes} budget={monthlyBudget} />

        {basket.length > 0 ? (
          <Card className="cw-pulse border-2 border-primary bg-primary/5">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                  <ShoppingBasket className="size-4" /> Compra pendiente
                </p>
                <p className="mt-1 text-2xl font-extrabold text-foreground">
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
            <CardContent className="flex h-full flex-col items-start justify-center gap-2 p-5">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                <ShoppingBasket className="size-4 text-muted-foreground" /> Sin compra pendiente
              </p>
              <p className="text-sm text-muted-foreground">
                Busca productos y agrégalos para comparar supermercados.
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link href="/productos">
                  Buscar productos <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos (máximo dos) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <MonthlyAccumChart purchases={monthConfirmed} />
        <CategorySpendChart purchases={monthConfirmed} />
      </div>

      {/* Diferencias destacadas */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Oportunidades"
          title="Diferencias destacadas"
          description="Las mayores brechas de precio entre supermercados (20% o más). Toca una para agregarla a tu compra."
        />
        <DealsCarousel limit={12} onAdd={addToBasket} />
      </section>

      {/* Ofertas temporales (solo si hubiera señal real) */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Promociones"
          title="Ofertas temporales"
          description="Solo mostramos ofertas cuando el snapshot detecta una promoción real."
        />
        <EmptyState
          icon={Tag}
          title="Sin ofertas temporales en este snapshot"
          description="Cuando una tienda marque un precio promocional sobre su precio de lista, aparecerá aquí."
        />
      </section>

      {/* Resúmenes: listas, despensa, historial */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bookmark className="size-4 text-primary" /> Listas guardadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-extrabold text-foreground">{savedLists.length}</p>
            <p className="text-sm text-muted-foreground">
              {savedLists.length ? "Listas reutilizables listas para comparar." : "Aún no guardas listas."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/listas">
                Ver listas <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBasket className="size-4 text-primary" /> Despensa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-extrabold text-foreground">{plural(pantryUnits, "unidad", "unidades")}</p>
            <p className="text-sm text-muted-foreground">
              {pantry.length ? `${plural(pantry.length, "producto")} en casa.` : "Tu almacén está vacío."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/despensa">
                Ver despensa <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-primary" /> Historial reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cuando confirmes una compra aparecerá aquí.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {recientes.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{p.store}</span>
                      <span className="text-xs text-muted-foreground">{shortDate(p.purchaseDate)}</span>
                    </span>
                    <span className="cw-price font-bold text-foreground">{money(p.realTotal)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/historial">
                Ver historial <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
