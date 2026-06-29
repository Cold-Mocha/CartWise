"use client";

import Link from "next/link";
import {
  Wallet,
  PiggyBank,
  BadgeCheck,
  ShoppingBasket,
  Bookmark,
  History,
  Tag,
  ArrowRight,
  Scale,
} from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CategorySpendChart, MonthlyAccumChart } from "@/components/dashboard/spend-charts";
import { DealsCarousel } from "@/components/landing/deals-carousel";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StoreCoverage } from "@/components/store/store-coverage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, monthKey, currentMonthLabel, plural, shortDate } from "@/lib/format";
import { SNAPSHOT_FECHA } from "@/lib/constants";

export default function DashboardPage() {
  const { basket, basketUnits, history, confirmed, savedLists, pantry, compareItems, addToBasket } =
    useAppState();

  const month = monthKey();
  const monthConfirmed = confirmed.filter((c) => monthKey(c.purchaseDate) === month);
  const gastoMes = monthConfirmed.reduce((s, c) => s + (c.realTotal || 0), 0);
  const ahorroConfirmado = monthConfirmed.reduce((s, c) => s + (c.confirmedSavings || 0), 0);
  const monthPlans = history.filter((p) => monthKey(p.createdAt) === month);
  const ahorroEstimado = monthPlans.reduce((s, p) => s + (p.savings || 0), 0);
  const recientes = [...confirmed].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const pantryUnits = pantry.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="space-y-10">
      {/* Encabezado + estado de datos */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Tu mes en comida</p>
          <h1 className="text-3xl font-extrabold capitalize tracking-tight text-foreground sm:text-4xl">
            {currentMonthLabel()}
          </h1>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2 text-right text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Snapshot {SNAPSHOT_FECHA}</span>
          <span className="mx-2 opacity-40">·</span>
          4 supermercados cubiertos
        </div>
      </div>

      {/* Métricas del mes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label="Gasto registrado del mes"
          value={money(gastoMes)}
          hint="Solo comida y bebida"
        />
        <MetricCard
          icon={PiggyBank}
          label="Ahorro estimado"
          value={money(ahorroEstimado)}
          hint="Según planes comparados"
          tone="savings"
        />
        <MetricCard
          icon={BadgeCheck}
          label="Ahorro confirmado"
          value={money(ahorroConfirmado)}
          hint="Según compras confirmadas"
          tone="savings"
        />
        <MetricCard
          icon={ShoppingBasket}
          label="Compra pendiente"
          value={plural(basketUnits, "producto")}
          hint={basket.length ? "Lista para comparar" : "Aún vacía"}
        />
      </div>

      {/* Compra pendiente destacada */}
      {basket.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-bold text-foreground">Tienes una compra pendiente sin comparar</p>
              <p className="text-sm text-muted-foreground">
                {plural(basket.length, "producto")} · {plural(basketUnits, "unidad", "unidades")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/compra-pendiente">Ver compra</Link>
              </Button>
              <Button onClick={() => compareItems(basket)}>
                <Scale /> Comparar supermercados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          description="Las mayores brechas de precio entre supermercados. Toca una para agregarla a tu compra."
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

      {/* Estado de datos */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Estado de los datos</p>
        <StoreCoverage />
      </section>
    </div>
  );
}
