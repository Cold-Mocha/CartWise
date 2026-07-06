"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { useComparison } from "@/components/state/comparison-provider";
import { useSavedLists } from "@/components/state/saved-lists-provider";
import type { SavedList, SavedPlan } from "@/types/cartwise";

// Flujos de listas guardadas que cruzan features: guardar la compra pendiente
// como lista, cargar una lista como compra pendiente o compararla directo.
export function useListWorkflows() {
  const router = useRouter();
  const { basket, setBasket } = usePendingPurchase();
  const { compareItems } = useComparison();
  const { addList, touchList } = useSavedLists();

  const saveCurrentAsList = (name: string) => {
    if (!basket.length) {
      toast("No hay productos para guardar como lista");
      return;
    }
    const list = addList(
      name.trim() || "Lista sin nombre",
      basket.map((item) => ({ ...item })),
    );
    toast.success(`Lista "${list.name}" guardada`);
  };

  const repeatList = (list: SavedList) => {
    if (!list.items.length) {
      toast("Esa lista no tiene productos");
      return;
    }
    setBasket(list.items.map((item) => ({ ...item })));
    touchList(list.id);
    toast.success(`Lista "${list.name}" cargada como compra pendiente`);
    router.push("/compra-pendiente");
  };

  const compareList = (list: SavedList) => {
    if (!list.items.length) {
      toast("Esa lista no tiene productos");
      return;
    }
    const lines = list.items.map((item) => ({ ...item }));
    touchList(list.id);
    // Compara la lista sin pasar por el carrito: no pisa una compra en curso
    // y el carrito queda como estaba (tras comparar, el flujo vive en /comparar).
    void compareItems(lines);
  };

  const savePlanAsList = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      toast("Ese plan no tiene líneas guardadas");
      return;
    }
    addList(
      `Compra ${plan.store} · ${plan.date}`,
      plan.lines.map((item) => ({ ...item })),
    );
    toast.success("Lista creada desde el plan");
  };

  return { saveCurrentAsList, repeatList, compareList, savePlanAsList };
}
