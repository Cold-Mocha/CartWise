"use client";

import Link from "next/link";
import { Scale, ArrowRight, Info, Search } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { StoreComparisonCard } from "@/components/comparison/store-comparison-card";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StoreLogo } from "@/components/brand/store-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money } from "@/lib/format";

export default function CompararPage() {
  const { comparison } = useAppState();

  if (!comparison || comparison.items.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="Paso 1 de 2" title="Comparación detallada" />
        <EmptyState
          icon={Scale}
          title="Aún no hay una comparación"
          description="Arma tu compra pendiente y compárala para ver qué supermercado conviene."
          action={
            <Button asChild>
              <Link href="/compra-pendiente">
                <Search /> Ir a mi compra pendiente
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const recommended = comparison.recommendedStore;
  const totalItems = comparison.items.length;
  // Orden: recomendada primero; el resto por (menos faltantes, menor total).
  const stores = [...comparison.stores].sort((a, b) => {
    if (recommended) {
      if (a.store.id === recommended.store.id) return -1;
      if (b.store.id === recommended.store.id) return 1;
    }
    return a.missingItems - b.missingItems || a.total - b.total;
  });

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Paso 1 de 2"
        title="Comparación detallada"
        description="El análisis completo: diferencias entre supermercados, alternativas y el precio de cada producto por tienda."
        action={
          recommended && (
            <Button asChild>
              <Link href="/plan-recomendado">
                Ver resumen <ArrowRight />
              </Link>
            </Button>
          )
        }
      />

      {/* Resumen de recomendación */}
      {recommended && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="size-4" /> Tienda recomendada
              </p>
              <p className="text-2xl font-extrabold text-foreground">{recommended.store.label}</p>
              <p className="text-sm text-muted-foreground">
                Cubre {recommended.pricedItems} de {totalItems} productos por{" "}
                <span className="font-bold text-foreground">{money(recommended.total)}</span>.
              </p>
            </div>
            {comparison.estimatedSavings > 0 && (
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ahorro estimado</p>
                <p className="cw-price text-3xl font-extrabold text-savings">{money(comparison.estimatedSavings)}</p>
                <p className="text-xs text-muted-foreground">frente a la tienda más cara con igual cobertura</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards por tienda */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stores.map((store) => (
          <StoreComparisonCard
            key={store.store.id}
            comparison={store}
            totalItems={totalItems}
            recommended={recommended?.store.id === store.store.id}
            diffVsRecommended={recommended ? store.total - recommended.total : 0}
          />
        ))}
      </div>

      {/* Detalle producto × tienda */}
      <section className="space-y-3">
        <h3 className="text-lg font-extrabold text-foreground">Detalle por producto</h3>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  {stores.map((s) => (
                    <TableHead key={s.store.id} className="text-right">
                      <span className="inline-flex items-center gap-1.5">
                        <StoreLogo name={s.store.label} size={22} />
                        {s.store.label}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.items.map((item) => {
                  const cells = stores.map((s) => s.lines.find((l) => l.itemId === item.id && l.kind === item.kind));
                  const prices = cells.map((c) => (c?.price != null ? c.price : Infinity));
                  const best = Math.min(...prices);
                  return (
                    <TableRow key={`${item.kind}-${item.id}`}>
                      <TableCell className="max-w-[220px]">
                        <span className="block truncate font-semibold text-foreground">{item.nombre}</span>
                        <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                      </TableCell>
                      {cells.map((c, i) => (
                        <TableCell key={i} className="text-right">
                          {c?.price != null ? (
                            <span
                              className={
                                c.price === best
                                  ? "cw-price font-extrabold text-savings"
                                  : "cw-price text-foreground"
                              }
                            >
                              {money(c.lineTotal)}
                            </span>
                          ) : (
                            <Badge variant="missing">No disponible</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
