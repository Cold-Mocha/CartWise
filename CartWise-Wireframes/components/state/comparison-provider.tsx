"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { compareBasket } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constants";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { PlanSelection } from "@/lib/comparison-plan";
import type { BasketComparison, BasketItem } from "@/types/cartwise";

// Comparación entre supermercados y selección de dónde comprar cada producto.
// Ambas persisten en localStorage para sobrevivir recargas: la comparación se
// recalcula al comparar de nuevo y se descarta al confirmar la compra
// correspondiente. La selección la comparten la matriz de /comparar y el
// resumen final de /plan-recomendado (lógica común en lib/comparison-plan).

type ComparisonState = {
  hydrated: boolean;
  comparison: BasketComparison | null;
  comparing: boolean;
  apiError: string | null;
  selection: PlanSelection;
  setSelection: React.Dispatch<React.SetStateAction<PlanSelection>>;
  // Devuelve true si la comparación se generó (y se navegó a /comparar).
  compareItems: (items: BasketItem[]) => Promise<boolean>;
  clearComparison: () => void;
};

const ComparisonContext = React.createContext<ComparisonState | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [comparison, setComparison, comparisonHydrated] =
    usePersistentState<BasketComparison | null>(STORAGE_KEYS.comparison, null);
  const [selection, setSelection, selectionHydrated] = usePersistentState<PlanSelection>(
    STORAGE_KEYS.selection,
    {},
  );
  const [comparing, setComparing] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const hydrated = comparisonHydrated && selectionHydrated;

  const compareItems = async (items: BasketItem[]) => {
    if (!items.length || comparing) return false;
    setApiError(null);
    setComparing(true);
    try {
      const data = await compareBasket(items);
      setComparison(data);
      // Cada comparación nueva parte con la selección automática (más barata).
      setSelection({});
      router.push("/comparar");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo comparar la compra.";
      setApiError(message);
      toast.error(message);
      return false;
    } finally {
      setComparing(false);
    }
  };

  const clearComparison = () => {
    setComparison(null);
    setSelection({});
  };

  return (
    <ComparisonContext.Provider
      value={{
        hydrated,
        comparison,
        comparing,
        apiError,
        selection,
        setSelection,
        compareItems,
        clearComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = React.useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison debe usarse dentro de ComparisonProvider");
  return ctx;
}
