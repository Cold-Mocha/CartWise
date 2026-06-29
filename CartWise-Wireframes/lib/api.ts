import type {
  BasketComparison,
  BasketItem,
  CategoryDeals,
  Health,
  ProductOffers,
  SearchItem,
} from "@/types/cartwise";

// Cliente de la API de Cartwise. Toda llamada HTTP a las route handlers pasa por
// aquí: los componentes visuales NO hacen fetch directo (plan §17).

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}) as { message?: string });
    throw new Error(body.message || `Error de API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<Health>("/api/health");
}

export async function getTopDeals(limit = 8) {
  const data = await request<{ items: SearchItem[] }>(`/api/deals/top?limit=${limit}`);
  return data.items;
}

export async function getDealsByCategory(perCategory = 10, categories = 6) {
  const data = await request<{ groups: CategoryDeals[] }>(
    `/api/deals/by-category?perCategory=${perCategory}&categories=${categories}`,
  );
  return data.groups;
}

export function getProductOffers(id: number) {
  return request<ProductOffers>(`/api/products/${id}/offers`);
}

export async function searchExactProducts(query: string, limit: number) {
  const data = await request<{ items: SearchItem[] }>(
    `/api/products/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  return data.items;
}

export async function searchGenericProducts(query: string, limit: number) {
  const data = await request<{ items: SearchItem[] }>(
    `/api/generic/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  return data.items;
}

export function compareBasket(items: BasketItem[]) {
  return request<BasketComparison>("/api/basket/compare", {
    method: "POST",
    body: JSON.stringify({
      items: items.map(({ id, kind, quantity }) => ({ id, kind, quantity })),
    }),
  });
}
