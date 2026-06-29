import type {BasketComparison, BasketItem, Health, SearchItem} from '../domain/types';
import {api} from '../lib/api';

export function getHealth() {
  return api<Health>('/api/health');
}

export async function getTopDeals(limit = 8) {
  const data = await api<{items: SearchItem[]}>(`/api/deals/top?limit=${limit}`);
  return data.items;
}

export async function searchExactProducts(query: string, limit: number) {
  const data = await api<{items: SearchItem[]}>(`/api/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return data.items;
}

export async function searchGenericProducts(query: string, limit: number) {
  const data = await api<{items: SearchItem[]}>(`/api/generic/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return data.items;
}

export function compareBasket(items: BasketItem[]) {
  return api<BasketComparison>('/api/basket/compare', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map(({id, kind, quantity}) => ({id, kind, quantity})),
    }),
  });
}
