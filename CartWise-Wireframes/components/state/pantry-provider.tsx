"use client";

import * as React from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { uid } from "@/lib/id";
import type {
  ConfirmedPurchaseItem,
  PantryItem,
  PantryItemDraft,
  SearchItem,
} from "@/types/cartwise";

// Despensa (almacén del hogar): lo que el usuario ya tiene en casa.

type PantryState = {
  hydrated: boolean;
  pantry: PantryItem[];
  addPantryItem: (draft: PantryItemDraft) => void;
  addProductsToPantry: (items: SearchItem[], quantities?: Record<string, number>) => void;
  addItemsFromPurchase: (items: ConfirmedPurchaseItem[]) => void;
  updatePantryQuantity: (id: string, quantity: number) => void;
  consumePantryItem: (id: string) => void;
};

const PantryContext = React.createContext<PantryState | null>(null);

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const [pantry, setPantry, hydrated] = usePersistentState<PantryItem[]>(STORAGE_KEYS.pantry, []);

  const addPantryItem = (data: PantryItemDraft) => {
    const now = new Date().toISOString();
    setPantry((current) => [
      {
        id: uid(),
        productName: data.productName.trim(),
        category: data.category ?? null,
        quantity: data.quantity,
        unit: data.unit ?? null,
        source: "manual",
        addedAt: now,
        updatedAt: now,
        notes: data.notes,
      },
      ...current,
    ]);
    toast.success(`${data.productName.trim()} agregado al almacén`);
  };

  // Agrega varios productos del catálogo a la despensa (flujo de selección
  // múltiple en su propia página, plan §6.2). Guarda el mejor precio/tienda del
  // snapshot al momento de agregar para mostrarlo luego sin volver a consultar.
  // `quantities` es opcional: mapa por `${kind}-${id}` con la cantidad elegida.
  const addProductsToPantry = (items: SearchItem[], quantities?: Record<string, number>) => {
    if (!items.length) return;
    const now = new Date().toISOString();
    const qtyOf = (it: SearchItem) => Math.max(1, quantities?.[`${it.kind}-${it.id}`] ?? 1);
    setPantry((current) => {
      const next = [...current];
      items.forEach((it) => {
        const qty = qtyOf(it);
        const idx = next.findIndex(
          (p) => p.productName.toLowerCase() === it.nombre.toLowerCase(),
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty, updatedAt: now };
        } else {
          // Solo guardamos id/precio para productos exactos: el comparable
          // genérico usa otro id y rompería la compra pendiente. Sin ese dato, el
          // hover de la despensa muestra "Sin precio disponible" (correcto).
          const exact = it.kind === "product";
          next.unshift({
            id: uid(),
            productId: exact ? it.id : null,
            productName: it.nombre,
            category: it.categoria ?? null,
            quantity: qty,
            source: "manual",
            addedAt: now,
            updatedAt: now,
            ean: exact ? it.ean ?? null : null,
            bestPrice: exact ? it.precio_min ?? null : null,
            bestPriceStore: exact ? it.precio_min_store_label ?? null : null,
          });
        }
      });
      return next;
    });
    toast.success(`${items.length} ${items.length === 1 ? "producto agregado" : "productos agregados"} a la despensa`);
  };

  // Vuelca los ítems de una compra confirmada en la despensa (sin toast propio:
  // el flujo de confirmación muestra el mensaje combinado).
  const addItemsFromPurchase = (items: ConfirmedPurchaseItem[]) => {
    const now = new Date().toISOString();
    setPantry((current) => {
      const next = [...current];
      items.forEach((it) => {
        const idx = next.findIndex(
          (p) => p.productName.toLowerCase() === it.productName.toLowerCase(),
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + it.quantity, updatedAt: now };
        } else {
          next.unshift({
            id: uid(),
            productName: it.productName,
            category: it.category ?? null,
            quantity: it.quantity,
            source: "confirmed_purchase",
            addedAt: now,
            updatedAt: now,
          });
        }
      });
      return next;
    });
  };

  const updatePantryQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setPantry((current) => current.filter((p) => p.id !== id));
      return;
    }
    setPantry((current) =>
      current.map((p) => (p.id === id ? { ...p, quantity, updatedAt: new Date().toISOString() } : p)),
    );
  };

  const consumePantryItem = (id: string) => {
    setPantry((current) => current.filter((p) => p.id !== id));
    toast("Producto marcado como consumido");
  };

  const value: PantryState = {
    hydrated,
    pantry,
    addPantryItem,
    addProductsToPantry,
    addItemsFromPurchase,
    updatePantryQuantity,
    consumePantryItem,
  };

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const ctx = React.useContext(PantryContext);
  if (!ctx) throw new Error("usePantry debe usarse dentro de PantryProvider");
  return ctx;
}
