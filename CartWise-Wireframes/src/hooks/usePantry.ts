import {useEffect, useState} from 'react';
import type {ConfirmedPurchaseItem, PantryItem, PantryItemDraft} from '../domain/types';
import {loadPantry, savePantry} from '../services/localStorageService';

export function usePantry(showToast: (message: string) => void) {
  const [pantry, setPantry] = useState<PantryItem[]>(loadPantry);

  useEffect(() => {
    savePantry(pantry);
  }, [pantry]);

  const addItemsToPantry = (items: ConfirmedPurchaseItem[]) => {
    const now = new Date().toISOString();
    setPantry((current) => {
      const next = [...current];
      items.forEach((it) => {
        const idx = next.findIndex((p) => p.productName.toLowerCase() === it.productName.toLowerCase());
        if (idx >= 0) {
          next[idx] = {...next[idx], quantity: next[idx].quantity + it.quantity, updatedAt: now};
        } else {
          next.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            productName: it.productName,
            category: it.category ?? null,
            quantity: it.quantity,
            source: 'confirmed_purchase',
            addedAt: now,
            updatedAt: now,
          });
        }
      });
      return next;
    });
  };

  const addPantryItem = (data: PantryItemDraft) => {
    const now = new Date().toISOString();
    setPantry((current) => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productName: data.productName.trim(),
      category: data.category ?? null,
      quantity: data.quantity,
      unit: data.unit ?? null,
      source: 'manual',
      addedAt: now,
      updatedAt: now,
      notes: data.notes,
    }, ...current]);
    showToast(`${data.productName.trim()} agregado al almacén`);
  };

  const updatePantryQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setPantry((current) => current.filter((p) => p.id !== id));
      return;
    }
    setPantry((current) => current.map((p) =>
      p.id === id ? {...p, quantity, updatedAt: new Date().toISOString()} : p,
    ));
  };

  const consumePantryItem = (id: string) => {
    setPantry((current) => current.filter((p) => p.id !== id));
    showToast('Producto marcado como consumido');
  };

  return {
    pantry,
    addItemsToPantry,
    addPantryItem,
    updatePantryQuantity,
    consumePantryItem,
  };
}
