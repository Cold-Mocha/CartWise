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
// para no inflar el carrusel de oportunidades. Regla del MVP: el precio más bajo
// debe ser al menos 20% menor que el más alto del mismo producto comparable, es
// decir precio_min <= precio_max * 0.8 (equiv. diferencia / precio_max >= 0.20).
// Requiere comparación real entre 2+ tiendas.
export const STRONG_DIFF_THRESHOLD = 0.2;

export function strongDifferencePct(item: SearchItem): number | null {
  const max = item.precio_max ?? 0;
  const diff = item.diferencia ?? 0;
  if ((item.n_tiendas ?? 0) < 2 || max <= 0 || diff <= 0) return null;
  return diff / max;
}

export function isStrongDifference(item: SearchItem) {
  const pct = strongDifferencePct(item);
  return pct !== null && pct >= STRONG_DIFF_THRESHOLD;
}

// Orden de vitrinas: productos con foto real primero (los sin EAN muestran un
// ícono referencial). Orden estable: no altera el orden relativo interno.
export function sortImageFirst<T extends { ean?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(Boolean(b.ean)) - Number(Boolean(a.ean)));
}
