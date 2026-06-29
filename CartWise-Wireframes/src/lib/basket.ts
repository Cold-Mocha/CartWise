import type {BasketItem, SavedPlan, SearchItem} from '../domain/types';

export function isAvailableFlag(value: SearchItem['precio_min_disponible']) {
  return value === true || value === 1;
}

export function planItemsSignature(items: BasketItem[]) {
  return items
    .map((item) => `${item.kind}:${item.id}:${item.quantity}`)
    .sort()
    .join('|');
}

export function savedPlanSignature(plan: SavedPlan) {
  return plan.lines?.length ? planItemsSignature(plan.lines) : `${plan.store}:${plan.total}:${plan.items}`;
}

export function buildGenericFromProduct(item: BasketItem): BasketItem | null {
  if (item.kind !== 'product' || !item.generico_id) return null;
  return {
    ...item,
    id: item.generico_id,
    kind: 'generic',
    nombre: item.generico_nombre || `Comparable de ${item.nombre}`,
    marca: null,
    categoria: item.generico_categoria || item.categoria,
    ean: null,
    unidad_base: item.generico_unidad_base,
    contenido_total_base: item.generico_contenido_total_base,
    match_label: 'Comparable por unidad',
  };
}
