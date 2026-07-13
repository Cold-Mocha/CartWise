"use client";

import * as React from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { GeneratedPurchase, GeneratedPurchaseStatus } from "@/types/cartwise";

type GeneratedPurchasesState = {
  hydrated: boolean;
  purchases: GeneratedPurchase[];
  addGeneratedPurchase: (purchase: GeneratedPurchase) => void;
  deleteGeneratedPurchase: (id: string) => void;
  updateGeneratedPurchaseStatus: (id: string, status: GeneratedPurchaseStatus) => void;
};

const GeneratedPurchasesContext = React.createContext<GeneratedPurchasesState | null>(null);

export function GeneratedPurchasesProvider({ children }: { children: React.ReactNode }) {
  const [purchases, setPurchases, hydrated] = usePersistentState<GeneratedPurchase[]>(
    STORAGE_KEYS.generatedPurchases,
    [],
  );

  const addGeneratedPurchase = (purchase: GeneratedPurchase) => {
    setPurchases((current) => [purchase, ...current]);
    toast.success("Compra generada · boletas creadas");
  };

  const deleteGeneratedPurchase = (id: string) => {
    setPurchases((current) => current.filter((purchase) => purchase.id !== id));
    toast("Compra generada eliminada");
  };

  const updateGeneratedPurchaseStatus = (id: string, status: GeneratedPurchaseStatus) => {
    setPurchases((current) =>
      current.map((purchase) => (purchase.id === id ? { ...purchase, status } : purchase)),
    );
  };

  return (
    <GeneratedPurchasesContext.Provider
      value={{
        hydrated,
        purchases,
        addGeneratedPurchase,
        deleteGeneratedPurchase,
        updateGeneratedPurchaseStatus,
      }}
    >
      {children}
    </GeneratedPurchasesContext.Provider>
  );
}

export function useGeneratedPurchases() {
  const ctx = React.useContext(GeneratedPurchasesContext);
  if (!ctx) throw new Error("useGeneratedPurchases debe usarse dentro de GeneratedPurchasesProvider");
  return ctx;
}
