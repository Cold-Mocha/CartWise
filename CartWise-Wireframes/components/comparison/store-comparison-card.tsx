"use client";

import { Check, X, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StoreLogo } from "@/components/brand/store-logo";
import { money, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StoreComparison } from "@/types/cartwise";

/*
  Card de comparación por supermercado. Muestra cobertura (cubiertos/faltantes),
  total estimado y la diferencia frente a la tienda recomendada. La recomendada
  se marca con corona: prioriza cobertura y luego precio (plan §13.6).
*/
export function StoreComparisonCard({
  comparison,
  recommended,
  diffVsRecommended,
  totalItems,
}: {
  comparison: StoreComparison;
  recommended: boolean;
  diffVsRecommended: number;
  totalItems: number;
}) {
  const coveragePct = Math.round(comparison.coverage * 100);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow",
        recommended ? "border-2 border-primary shadow-lg" : "border-border",
      )}
    >
      {recommended && (
        <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">
          <Crown className="size-3.5" /> Recomendado
        </div>
      )}
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <StoreLogo name={comparison.store.label} size={36} />
          <h3 className="text-lg font-extrabold text-foreground">{comparison.store.label}</h3>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total estimado</p>
          <p className="cw-price text-3xl font-extrabold text-foreground">{money(comparison.total)}</p>
          {!recommended && diffVsRecommended > 0 && (
            <p className="text-xs font-bold text-destructive">+{money(diffVsRecommended)} vs. recomendada</p>
          )}
          {recommended && <p className="text-xs font-bold text-savings">Mejor combinación de cobertura y precio</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              {comparison.pricedItems}/{totalItems} productos cubiertos
            </span>
            <span className="text-muted-foreground">{coveragePct}%</span>
          </div>
          <Progress value={coveragePct} indicatorClassName={recommended ? "bg-primary" : "bg-muted-foreground/50"} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="savings">
            <Check className="size-3" /> {plural(comparison.pricedItems, "cubierto")}
          </Badge>
          {comparison.missingItems > 0 && (
            <Badge variant="missing">
              <X className="size-3" /> {plural(comparison.missingItems, "faltante")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
