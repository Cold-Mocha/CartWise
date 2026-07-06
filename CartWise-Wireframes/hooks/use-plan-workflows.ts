"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SNAPSHOT_FECHA } from "@/lib/constants";
import { uid } from "@/lib/id";
import { planItemsSignature, savedPlanSignature } from "@/lib/basket";
import { buildPlan, lineFor } from "@/lib/comparison-plan";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { useComparison } from "@/components/state/comparison-provider";
import { usePurchaseHistory } from "@/components/state/purchase-history-provider";
import { usePantry } from "@/components/state/pantry-provider";
import type { ConfirmPurchaseData, ConfirmedPurchase, SavedPlan } from "@/types/cartwise";

// Flujos de planes de compra que cruzan varias features (comparación → plan →
// compra confirmada → despensa). Los providers no se conocen entre sí: este
// hook los compone para las páginas que ejecutan el flujo completo.
export function usePlanWorkflows() {
  const router = useRouter();
  const { basket, setBasket } = usePendingPurchase();
  const { comparison, selection, compareItems, clearComparison } = useComparison();
  const { history, addPlan, highlightPlan, recordPurchase } = usePurchaseHistory();
  const { addItemsFromPurchase } = usePantry();

  // Confirma el plan armado en la matriz de comparación: lo guarda en Compras
  // como compra pendiente (sin duplicar) y lleva al resumen final. Con esto la
  // compra ya queda creada, a la espera de confirmarse cuando se realice.
  const confirmPlan = () => {
    if (!comparison) return;
    const plan = buildPlan(comparison, selection);
    if (plan.covered === 0) return;
    const storeLabel = plan.groups.map((g) => g.store.store.label).join(" + ");
    const assigned = plan.lines.filter((l) => l.assigned != null);
    const selectedItems = assigned.map(({ item }) => ({ ...item }));
    // Líneas con el precio y la tienda asignada a cada producto: son las que
    // usa el detalle de la compra (y su confirmación) como precio del plan y
    // como "dónde se planificó comprar" cada producto.
    const planLines = assigned.flatMap(({ item, assigned: store }) => {
      const line = store ? lineFor(store, item) : null;
      return line ? [{ ...line, storeLabel: store?.store.label ?? null }] : [];
    });
    const signature = planItemsSignature(selectedItems);
    // Solo cuentan como duplicado las compras aún pendientes: repetir una
    // compra ya realizada debe crear una compra nueva.
    const duplicate = history.find(
      (p) =>
        p.status !== "purchased" &&
        p.store === storeLabel &&
        p.total === plan.total &&
        savedPlanSignature(p) === signature,
    );
    if (duplicate) {
      highlightPlan(duplicate.id);
      router.push("/plan-recomendado");
      return;
    }
    const now = new Date();
    const saved: SavedPlan = {
      id: uid(),
      date: now.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" }),
      createdAt: now.toISOString(),
      snapshotDate: comparison.snapshot ?? SNAPSHOT_FECHA,
      total: plan.total,
      store: storeLabel,
      items: plan.covered,
      savings: 0,
      status: "pending",
      lines: selectedItems,
      recommendedLines: planLines,
    };
    addPlan(saved);
    highlightPlan(saved.id);
    toast.success("Compra creada · pendiente de confirmar");
    router.push("/plan-recomendado");
  };

  // Repite una compra del historial: regenera la comparación con los mismos
  // productos y lleva a /comparar para elegir dónde comprar y confirmar de
  // nuevo. No toca el carrito: una compra en preparación no se pierde.
  const repeatPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      toast("Esa compra no tiene líneas guardadas");
      return;
    }
    void compareItems(plan.lines.map((item) => ({ ...item })));
  };

  const confirmPurchase = (plan: SavedPlan, data: ConfirmPurchaseData) => {
    const estimatedTotal = plan.total;
    const estimatedSavings = plan.savings ?? 0;
    const confirmedSavings = estimatedSavings + (estimatedTotal - data.realTotal);
    const purchase: ConfirmedPurchase = {
      id: uid(),
      planId: plan.id,
      store: plan.store,
      purchaseDate: data.purchaseDate,
      estimatedTotal,
      realTotal: data.realTotal,
      estimatedSavings,
      confirmedSavings,
      items: data.items,
      createdAt: new Date().toISOString(),
    };
    recordPurchase(purchase);
    if (data.addToPantry) {
      addItemsFromPurchase(data.items);
      toast.success("Compra confirmada · productos enviados a tu despensa");
    } else {
      toast.success("Compra confirmada y registrada");
    }
    // Limpiamos el carrito o la comparación solo si corresponden a la compra
    // que se acaba de confirmar; si hay otra compra en curso, no se toca.
    // Nos quedamos en /compras para ver la compra pasar al historial.
    const signature = savedPlanSignature(plan);
    if (basket.length > 0 && signature === planItemsSignature(basket)) setBasket([]);
    if (comparison && signature === planItemsSignature(comparison.items)) clearComparison();
  };

  return { confirmPlan, repeatPlan, confirmPurchase };
}
