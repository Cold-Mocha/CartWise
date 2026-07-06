"use client";

import * as React from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { buildGenericFromProduct } from "@/lib/basket";
import type { BasketItem, SearchItem } from "@/types/cartwise";

// Compra pendiente: los productos que el usuario está armando para comparar.

type PendingPurchaseState = {
  hydrated: boolean;
  basket: BasketItem[];
  basketUnits: number;
  setBasket: (items: BasketItem[]) => void;
  addToBasket: (item: SearchItem) => void;
  removeFromBasket: (item: BasketItem) => void;
  updateQuantity: (item: BasketItem, quantity: number) => void;
  clearBasket: () => void;
  switchToGeneric: (item: BasketItem) => void;
};

const PendingPurchaseContext = React.createContext<PendingPurchaseState | null>(null);

export function PendingPurchaseProvider({ children }: { children: React.ReactNode }) {
  const [storedBasket, setBasketState, hydrated] = usePersistentState<BasketItem[]>(
    STORAGE_KEYS.basket,
    [],
  );

  // La comparación por unidad quedó fuera del flujo: los comparables genéricos
  // de sesiones anteriores se dejan fuera de la vista (no se borran del storage).
  const basket = React.useMemo(
    () => storedBasket.filter((item) => item.kind === "product"),
    [storedBasket],
  );

  const basketUnits = React.useMemo(
    () => basket.reduce((sum, item) => sum + item.quantity, 0),
    [basket],
  );

  const setBasket = (items: BasketItem[]) => setBasketState(items);

  const addToBasket = (item: SearchItem) => {
    setBasketState((current) => {
      const existing = current.find((row) => row.id === item.id && row.kind === item.kind);
      if (existing) {
        return current.map((row) =>
          row.id === item.id && row.kind === item.kind
            ? { ...row, quantity: row.quantity + 1 }
            : row,
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
    toast.success(`${item.nombre} · agregado a tu compra`);
  };

  const removeFromBasket = (item: BasketItem) => {
    setBasketState((current) =>
      current.filter((row) => !(row.id === item.id && row.kind === item.kind)),
    );
    toast(`${item.nombre} · quitado de tu compra`);
  };

  const clearBasket = () => {
    setBasketState([]);
    toast("Compra pendiente vaciada");
  };

  const updateQuantity = (item: BasketItem, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(item);
      return;
    }
    setBasketState((current) =>
      current.map((row) =>
        row.id === item.id && row.kind === item.kind ? { ...row, quantity } : row,
      ),
    );
  };

  const switchToGeneric = (item: BasketItem) => {
    const generic = buildGenericFromProduct(item);
    if (!generic) {
      toast("Ese producto no tiene comparable asociado");
      return;
    }
    setBasketState((current) => {
      const withoutExact = current.filter((row) => !(row.id === item.id && row.kind === item.kind));
      const existing = withoutExact.find((row) => row.kind === "generic" && row.id === generic.id);
      if (existing) {
        return withoutExact.map((row) =>
          row.kind === "generic" && row.id === generic.id
            ? { ...row, quantity: row.quantity + item.quantity }
            : row,
        );
      }
      return [...withoutExact, generic];
    });
    toast.success(`${item.nombre} cambiado por comparable`);
  };

  const value: PendingPurchaseState = {
    hydrated,
    basket,
    basketUnits,
    setBasket,
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    switchToGeneric,
  };

  return <PendingPurchaseContext.Provider value={value}>{children}</PendingPurchaseContext.Provider>;
}

export function usePendingPurchase() {
  const ctx = React.useContext(PendingPurchaseContext);
  if (!ctx) throw new Error("usePendingPurchase debe usarse dentro de PendingPurchaseProvider");
  return ctx;
}
