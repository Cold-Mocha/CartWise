import type { BasketItem, SavedPlan, SearchItem } from "@/types/cartwise";

// Disponibilidad: el bridge puede devolver boolean o 1/0.
export function isAvailableFlag(value: SearchItem["precio_min_disponible"]) {
  return value === true || value === 1;
}

// Firma estable de una compra para detectar planes duplicados.
export function planItemsSignature(items: BasketItem[]) {
  return items
    .map((item) => `${item.kind}:${item.id}:${item.quantity}`)
    .sort()
    .join("|");
}

export function savedPlanSignature(plan: SavedPlan) {
  return plan.lines?.length
    ? planItemsSignature(plan.lines)
    : `${plan.store}:${plan.total}:${plan.items}`;
}

// Convierte un producto exacto a su comparable genérico, si lo tiene.
export function buildGenericFromProduct(item: BasketItem): BasketItem | null {
  if (item.kind !== "product" || !item.generico_id) return null;
  return {
    ...item,
    id: item.generico_id,
    kind: "generic",
    nombre: item.generico_nombre || `Comparable de ${item.nombre}`,
    marca: null,
    categoria: item.generico_categoria || item.categoria,
    ean: null,
    unidad_base: item.generico_unidad_base,
    contenido_total_base: item.generico_contenido_total_base,
    match_label: "Comparable por unidad",
  };
}

// ¿Una diferencia de precio entre tiendas es "destacada"? Umbral conservador
// para no inflar el carrusel de oportunidades.
export function isStrongDifference(item: SearchItem) {
  const diff = item.diferencia ?? 0;
  const min = item.precio_min ?? 0;
  if (!diff || !min) return false;
  return diff >= 300 && diff / min >= 0.12;
}
