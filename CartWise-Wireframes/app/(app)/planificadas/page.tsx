"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Repeat, Eye, Trash2, BadgeCheck, Scale, Search } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { ConfirmPurchaseDialog } from "@/components/history/confirm-purchase-dialog";
import { PlanDetailDialog } from "@/components/history/plan-detail-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, shortDate, plural } from "@/lib/format";
import type { SavedPlan } from "@/types/cartwise";

/*
  Compras planificadas: planes guardados que todavía NO se han comprado. Guardar
  un plan crea una plantilla de compra, no una compra realizada. Al confirmar,
  el plan pasa al historial y desaparece de aquí.
*/
export default function PlanificadasPage() {
  const {
    history,
    highlightedPlanId,
    repeatPlan,
    compareSavedPlan,
    deletePlan,
    confirmPurchase,
  } = useAppState();

  const [detail, setDetail] = useState<SavedPlan | null>(null);
  const [confirming, setConfirming] = useState<SavedPlan | null>(null);

  // Solo planes no comprados.
  const planes = history.filter((p) => p.status !== "purchased");

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Compras planificadas"
        description="Planes de compra que guardaste para más tarde. Todavía no son compras realizadas: confírmalas cuando las compres."
      />

      {planes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tienes compras planificadas"
          description="Compara tu compra y guarda el plan como compra planificada para tenerlo a mano."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Armar una compra
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {planes.map((plan) => (
            <Card
              key={plan.id}
              className={highlightedPlanId === plan.id ? "border-primary ring-2 ring-primary/30" : ""}
            >
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-[160px] flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-extrabold text-foreground">{plan.store}</p>
                    <Badge variant="default">Planificada</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {shortDate(plan.createdAt) || plan.date} · {plural(plan.items, "producto")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="cw-price text-lg font-extrabold text-foreground">{money(plan.total)}</p>
                  {plan.savings > 0 && (
                    <p className="text-xs font-bold text-savings">Ahorro est. {money(plan.savings)}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => repeatPlan(plan)}>
                    <Repeat /> Repetir
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => compareSavedPlan(plan)}>
                    <Scale /> Comparar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDetail(plan)}>
                    <Eye /> Detalle
                  </Button>
                  <Button size="sm" onClick={() => setConfirming(plan)}>
                    <BadgeCheck /> Confirmar compra
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deletePlan(plan.id)}
                    aria-label="Eliminar compra planificada"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanDetailDialog plan={detail} onClose={() => setDetail(null)} />
      <ConfirmPurchaseDialog plan={confirming} onClose={() => setConfirming(null)} onConfirm={confirmPurchase} />
    </div>
  );
}
