"use client";

import Link from "next/link";
import { useState } from "react";
import {
  History,
  Repeat,
  Bookmark,
  Eye,
  Trash2,
  BadgeCheck,
  Scale,
  Search,
} from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { ConfirmPurchaseDialog } from "@/components/history/confirm-purchase-dialog";
import { PlanDetailDialog } from "@/components/history/plan-detail-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, shortDate, plural } from "@/lib/format";
import { PLAN_STATUS_LABELS } from "@/lib/constants";
import type { PlanStatus, SavedPlan } from "@/types/cartwise";

const STATUS_VARIANT: Record<PlanStatus, "default" | "savings" | "muted"> = {
  pending: "default",
  purchased: "savings",
  discarded: "muted",
};

export default function HistorialPage() {
  const {
    history,
    confirmed,
    highlightedPlanId,
    repeatPlan,
    compareSavedPlan,
    savePlanAsList,
    deletePlan,
    confirmPurchase,
  } = useAppState();

  const [detail, setDetail] = useState<SavedPlan | null>(null);
  const [confirming, setConfirming] = useState<SavedPlan | null>(null);

  const isEmpty = history.length === 0 && confirmed.length === 0;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Tu actividad"
        title="Historial de compras"
        description="Planes guardados y compras confirmadas. Repite, compara o guarda como lista cuando quieras."
      />

      {isEmpty ? (
        <EmptyState
          icon={History}
          title="Tu historial está vacío"
          description="Cuando confirmes una compra aparecerá aquí."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Empezar una compra
              </Link>
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="planes">
          <TabsList>
            <TabsTrigger value="planes">Planes guardados ({history.length})</TabsTrigger>
            <TabsTrigger value="confirmadas">Compras confirmadas ({confirmed.length})</TabsTrigger>
          </TabsList>

          {/* Planes guardados */}
          <TabsContent value="planes" className="space-y-3">
            {history.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="Sin planes guardados"
                description="Compara una compra y guarda el plan recomendado para tenerlo a mano."
              />
            ) : (
              history.map((plan) => (
                <Card
                  key={plan.id}
                  className={highlightedPlanId === plan.id ? "border-primary ring-2 ring-primary/30" : ""}
                >
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-[160px] flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-extrabold text-foreground">{plan.store}</p>
                        <Badge variant={STATUS_VARIANT[plan.status ?? "pending"]}>
                          {PLAN_STATUS_LABELS[plan.status ?? "pending"]}
                        </Badge>
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
                      <Button size="sm" variant="outline" onClick={() => savePlanAsList(plan)}>
                        <Bookmark /> Lista
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDetail(plan)}>
                        <Eye /> Detalle
                      </Button>
                      {plan.status !== "purchased" && (
                        <Button size="sm" onClick={() => setConfirming(plan)}>
                          <BadgeCheck /> Confirmar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deletePlan(plan.id)}
                        aria-label="Eliminar plan"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Compras confirmadas */}
          <TabsContent value="confirmadas" className="space-y-3">
            {confirmed.length === 0 ? (
              <EmptyState
                icon={BadgeCheck}
                title="Sin compras confirmadas"
                description="Confirma un plan para registrar tu gasto y ahorro real."
              />
            ) : (
              confirmed.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-[160px] flex-1">
                      <p className="text-base font-extrabold text-foreground">{purchase.store}</p>
                      <p className="text-xs text-muted-foreground">
                        {shortDate(purchase.purchaseDate)} · {plural(purchase.items.length, "producto")}
                      </p>
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
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <PlanDetailDialog plan={detail} onClose={() => setDetail(null)} />
      <ConfirmPurchaseDialog plan={confirming} onClose={() => setConfirming(null)} onConfirm={confirmPurchase} />
    </div>
  );
}
