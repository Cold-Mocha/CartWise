"use client";

import * as React from "react";
import { toast } from "sonner";
import { PLAN_STATUS_LABELS, STORAGE_KEYS } from "@/lib/constants";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { ConfirmedPurchase, PlanStatus, SavedPlan } from "@/types/cartwise";

// Compras pendientes (planes creados, aún no comprados) e historial de
// compras confirmadas: ambas secciones de la pantalla Compras. Los flujos que
// cruzan features (crear plan desde la comparación, confirmar compra) viven
// en hooks/use-plan-workflows.ts.

type PurchaseHistoryState = {
  hydrated: boolean;
  history: SavedPlan[];
  confirmed: ConfirmedPurchase[];
  highlightedPlanId: string | null;
  highlightPlan: (id: string) => void;
  addPlan: (plan: SavedPlan) => void;
  deletePlan: (id: string) => void;
  updatePlanStatus: (id: string, status: PlanStatus) => void;
  recordPurchase: (purchase: ConfirmedPurchase) => void;
  deletePurchase: (id: string) => void;
};

const PurchaseHistoryContext = React.createContext<PurchaseHistoryState | null>(null);

export function PurchaseHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory, historyHydrated] = usePersistentState<SavedPlan[]>(
    STORAGE_KEYS.history,
    [],
  );
  const [confirmed, setConfirmed, confirmedHydrated] = usePersistentState<ConfirmedPurchase[]>(
    STORAGE_KEYS.confirmed,
    [],
  );
  const [highlightedPlanId, setHighlightedPlanId] = React.useState<string | null>(null);

  const hydrated = historyHydrated && confirmedHydrated;

  React.useEffect(() => {
    if (!highlightedPlanId) return;
    const t = setTimeout(() => setHighlightedPlanId(null), 3800);
    return () => clearTimeout(t);
  }, [highlightedPlanId]);

  const highlightPlan = (id: string) => setHighlightedPlanId(id);

  const addPlan = (plan: SavedPlan) => {
    setHistory((current) => [plan, ...current]);
  };

  const deletePlan = (id: string) => {
    setHistory((current) => current.filter((plan) => plan.id !== id));
    toast("Plan eliminado");
  };

  const updatePlanStatus = (id: string, status: PlanStatus) => {
    setHistory((current) => current.map((plan) => (plan.id === id ? { ...plan, status } : plan)));
    toast(`Estado actualizado: ${PLAN_STATUS_LABELS[status]}`);
  };

  // Registra una compra confirmada y marca su plan de origen como comprado.
  const recordPurchase = (purchase: ConfirmedPurchase) => {
    setConfirmed((current) => [purchase, ...current]);
    setHistory((current) =>
      current.map((p) => (p.id === purchase.planId ? { ...p, status: "purchased" } : p)),
    );
  };

  // Borra una compra confirmada del historial.
  const deletePurchase = (id: string) => {
    setConfirmed((current) => current.filter((purchase) => purchase.id !== id));
    toast("Compra eliminada del historial");
  };

  const value: PurchaseHistoryState = {
    hydrated,
    history,
    confirmed,
    highlightedPlanId,
    highlightPlan,
    addPlan,
    deletePlan,
    updatePlanStatus,
    recordPurchase,
    deletePurchase,
  };

  return <PurchaseHistoryContext.Provider value={value}>{children}</PurchaseHistoryContext.Provider>;
}

export function usePurchaseHistory() {
  const ctx = React.useContext(PurchaseHistoryContext);
  if (!ctx) throw new Error("usePurchaseHistory debe usarse dentro de PurchaseHistoryProvider");
  return ctx;
}
