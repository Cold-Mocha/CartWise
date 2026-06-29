import {useState} from 'react';
import type {BasketComparison, BasketItem, View} from '../domain/types';
import {compareBasket as compareBasketRequest} from '../services/cartwiseApi';

export function useComparison(setView: (view: View) => void) {
  const [comparison, setComparison] = useState<BasketComparison | null>(null);
  const [comparing, setComparing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const compareItems = async (items: BasketItem[]) => {
    if (!items.length || comparing) return;
    setApiError(null);
    setComparing(true);
    try {
      const data = await compareBasketRequest(items);
      setComparison(data);
      setView('comparison');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'No se pudo comparar la compra.');
    } finally {
      setComparing(false);
    }
  };

  return {
    comparison,
    comparing,
    apiError,
    setApiError,
    compareItems,
  };
}
