"use client";

import Link from "next/link";
import { useState } from "react";
import { Crown, Check, X, Save, BadgeCheck, Scale, Search } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { ConfirmPurchaseDialog } from "@/components/history/confirm-purchase-dialog";
import { SaveListDialog } from "@/components/purchase/save-list-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { TransparencyNote } from "@/components/common/transparency-note";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { money, plural } from "@/lib/format";
import type { SavedPlan } from "@/types/cartwise";

export default function PlanRecomendadoPage() {
  const { comparison, savePlan, saveCurrentAsList, createPlanFromComparison, confirmPurchase } = useAppState();
  const [confirming, setConfirming] = useState<SavedPlan | null>(null);

  const rec = comparison?.recommendedStore;

  if (!comparison || !rec) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="Plan recomendado" title="Plan recomendado" />
        <EmptyState
          icon={Crown}
          title="Todavía no hay un plan"
          description="Compara tu compra pendiente para obtener una tienda recomendada."
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

  const totalItems = comparison.items.length;
  const covered = rec.lines.filter((l) => l.price != null);
  const missing = rec.lines.filter((l) => l.price == null);

  const startConfirm = () => {
    const plan = createPlanFromComparison();
    if (plan) setConfirming(plan);
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Plan recomendado"
        title="Tu plan de compra"
        description="La tienda que mejor combina cobertura y precio para tu compra pendiente."
        action={
          <Button asChild variant="outline">
            <Link href="/comparar">
              <Scale /> Ver comparación
            </Link>
          </Button>
        }
      />

      {/* Cabecera del plan */}
      <Card className="overflow-hidden border-2 border-primary">
        <div className="flex items-center gap-2 bg-primary px-5 py-2 text-sm font-extrabold text-primary-foreground">
          <Crown className="size-4" /> Supermercado recomendado
        </div>
        <CardContent className="grid gap-6 p-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tienda</p>
            <p className="text-2xl font-extrabold text-foreground">{rec.store.label}</p>
            <p className="text-sm text-muted-foreground">
              Cubre {rec.pricedItems} de {totalItems} productos
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total estimado</p>
            <p className="cw-price text-3xl font-extrabold text-foreground">{money(rec.total)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ahorro estimado</p>
            <p className="cw-price text-3xl font-extrabold text-savings">{money(comparison.estimatedSavings)}</p>
          </div>
        </CardContent>
        <Separator />
        <CardContent className="flex flex-wrap gap-2 p-5">
          <Button onClick={startConfirm}>
            <BadgeCheck /> Confirmar compra
          </Button>
          <Button variant="outline" onClick={savePlan}>
            <Save /> Guardar plan
          </Button>
          <SaveListDialog onSave={saveCurrentAsList} />
        </CardContent>
      </Card>

      {/* Productos incluidos */}
      <section className="space-y-3">
        <h3 className="text-lg font-extrabold text-foreground">
          Productos incluidos <span className="text-muted-foreground">({plural(covered.length, "producto")})</span>
        </h3>
        <div className="grid gap-2.5">
          {covered.map((line) => (
            <Card key={`${line.kind}-${line.itemId}`}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="size-12 shrink-0 rounded-md bg-white p-1">
                  <ProductImage ean={line.ean} alt={line.name} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.matchedProductName && line.matchedProductName !== line.name
                      ? `${line.matchedProductName} · `
                      : ""}
                    ×{line.quantity}
                  </p>
                </div>
                <Badge variant="savings">
                  <Check className="size-3" /> Disponible
                </Badge>
                <span className="cw-price w-24 text-right text-sm font-extrabold text-foreground">
                  {money(line.lineTotal)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Productos faltantes */}
      {missing.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-extrabold text-foreground">
            Productos faltantes en {rec.store.label}{" "}
            <span className="text-muted-foreground">({plural(missing.length, "producto")})</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Esta tienda no tiene precio para estos productos en el snapshot. No los ocultamos: considéralos al decidir.
          </p>
          <div className="grid gap-2.5">
            {missing.map((line) => (
              <Card key={`${line.kind}-${line.itemId}`} className="border-destructive/30">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{line.name}</p>
                    <p className="text-xs text-muted-foreground">×{line.quantity}</p>
                  </div>
                  <Badge variant="missing">
                    <X className="size-3" /> Sin precio
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <TransparencyNote />

      <ConfirmPurchaseDialog
        plan={confirming}
        onClose={() => setConfirming(null)}
        onConfirm={confirmPurchase}
      />
    </div>
  );
}
