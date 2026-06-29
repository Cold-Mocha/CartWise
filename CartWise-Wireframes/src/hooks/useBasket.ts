import {useEffect, useMemo, useState} from 'react';
import type {BasketItem, SearchItem} from '../domain/types';
import {buildGenericFromProduct} from '../lib/basket';
import {loadBasket, saveBasket} from '../services/localStorageService';

export function useBasket(showToast: (message: string) => void) {
  const [basket, setBasket] = useState<BasketItem[]>(loadBasket);

  useEffect(() => {
    saveBasket(basket);
  }, [basket]);

  const basketUnits = useMemo(
    () => basket.reduce((sum, item) => sum + item.quantity, 0),
    [basket],
  );

  const addToBasket = (item: SearchItem) => {
    setBasket((current) => {
      const existing = current.find((row) => row.id === item.id && row.kind === item.kind);
      if (existing) {
        return current.map((row) =>
          row.id === item.id && row.kind === item.kind
            ? {...row, quantity: row.quantity + 1}
            : row,
        );
      }
      return [...current, {...item, quantity: 1}];
    });
    showToast(`${item.nombre} · agregado a tu compra`);
  };

  const removeFromBasket = (item: BasketItem) => {
    setBasket((current) => current.filter((row) => !(row.id === item.id && row.kind === item.kind)));
    showToast(`${item.nombre} · quitado de tu compra`);
  };

  const clearBasket = () => {
    setBasket([]);
    showToast('Compra pendiente vaciada');
  };

  const updateQuantity = (item: BasketItem, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(item);
      return;
    }
    setBasket((current) => current.map((row) =>
      row.id === item.id && row.kind === item.kind ? {...row, quantity} : row,
    ));
  };

  const switchToGeneric = (item: BasketItem) => {
    const generic = buildGenericFromProduct(item);
    if (!generic) {
      showToast('Ese producto no tiene comparable asociado');
      return;
    }
    setBasket((current) => {
      const withoutExact = current.filter((row) => !(row.id === item.id && row.kind === item.kind));
      const existingGeneric = withoutExact.find((row) => row.kind === 'generic' && row.id === generic.id);
      if (existingGeneric) {
        return withoutExact.map((row) =>
          row.kind === 'generic' && row.id === generic.id
            ? {...row, quantity: row.quantity + item.quantity}
            : row,
        );
      }
      return [...withoutExact, generic];
    });
    showToast(`${item.nombre} cambiado por comparable`);
  };

  return {
    basket,
    setBasket,
    basketUnits,
    addToBasket,
    removeFromBasket,
    clearBasket,
    updateQuantity,
    switchToGeneric,
  };
}
