import type { BasketComparison, BasketItem, StoreComparison } from "@/types/cartwise";

/*
  Plan de compra armado sobre la matriz de comparación. La selección vive en
  ComparisonProvider y la comparten la página de selección (/comparar) y el
  resumen final (/plan-recomendado): aquí está la lógica común de asignación
  y agrupación por tienda para que ambas muestren exactamente el mismo plan.
*/

// Selección por producto: ausente = automático (la opción más barata);
// número = tienda elegida a mano; null = deseleccionado (no se compra).
export type PlanSelection = Record<string, number | null>;

export const itemKey = (item: Pick<BasketItem, "id" | "kind">) => `${item.kind}-${item.id}`;

export const lineFor = (store: StoreComparison, item: Pick<BasketItem, "id" | "kind">) =>
  store.lines.find((l) => l.itemId === item.id && l.kind === item.kind);

// Tiendas en el orden de las columnas de la matriz: primero las de mayor
// cobertura y, a igual cobertura, la de menor total.
export const sortedStores = (comparison: BasketComparison) =>
  [...comparison.stores].sort((a, b) => a.missingItems - b.missingItems || a.total - b.total);

// Tienda asignada a un producto: la selección manual si sigue disponible;
// si no, la más barata entre todos los supermercados.
export function assignedStoreFor(
  stores: StoreComparison[],
  selection: PlanSelection,
  item: BasketItem,
): StoreComparison | null {
  const choice = selection[itemKey(item)];
  if (choice === null) return null;
  const manual = stores.find((s) => s.store.id === choice);
  if (manual && lineFor(manual, item)?.price != null) return manual;
  let best: StoreComparison | null = null;
  for (const s of stores) {
    const price = lineFor(s, item)?.price;
    if (price == null) continue;
    if (!best || price < (lineFor(best, item)?.price ?? Infinity)) best = s;
  }
  return best;
}

export type PlanStoreGroup = {
  store: StoreComparison;
  lines: { item: BasketItem; lineTotal: number }[];
  subtotal: number;
};

export type SelectionPlan = {
  stores: StoreComparison[];
  lines: { item: BasketItem; assigned: StoreComparison | null }[];
  groups: PlanStoreGroup[];
  total: number;
  covered: number;
};

// Plan resultante de la selección: cada producto con su tienda asignada y
// los grupos por tienda con subtotal y total combinado.
export function buildPlan(comparison: BasketComparison, selection: PlanSelection): SelectionPlan {
  const stores = sortedStores(comparison);
  const lines = comparison.items.map((item) => ({
    item,
    assigned: assignedStoreFor(stores, selection, item),
  }));
  const groups = stores
    .map((store) => {
      const own = lines
        .filter((l) => l.assigned?.store.id === store.store.id)
        .map(({ item }) => ({ item, lineTotal: lineFor(store, item)?.lineTotal ?? 0 }));
      return { store, lines: own, subtotal: own.reduce((sum, l) => sum + l.lineTotal, 0) };
    })
    .filter((g) => g.lines.length > 0);
  return {
    stores,
    lines,
    groups,
    total: groups.reduce((sum, g) => sum + g.subtotal, 0),
    covered: lines.filter((l) => l.assigned != null).length,
  };
}
