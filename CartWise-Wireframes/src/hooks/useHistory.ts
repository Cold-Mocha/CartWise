import {useEffect, useState} from 'react';
import {PLAN_STATUS_LABELS, SNAPSHOT_FECHA} from '../domain/constants';
import type {
  BasketComparison,
  BasketItem,
  ConfirmPurchaseData,
  ConfirmedPurchase,
  PlanStatus,
  SavedPlan,
  View,
} from '../domain/types';
import {planItemsSignature, savedPlanSignature} from '../lib/basket';
import {
  loadConfirmedPurchases,
  loadHistory,
  saveConfirmedPurchases,
  saveHistory,
} from '../services/localStorageService';

type UseHistoryOptions = {
  basket: BasketItem[];
  comparison: BasketComparison | null;
  setBasket: (items: BasketItem[]) => void;
  compareItems: (items: BasketItem[]) => void;
  setView: (view: View) => void;
  showToast: (message: string) => void;
  addItemsToPantry: (items: ConfirmPurchaseData['items']) => void;
};

export function useHistory({
  basket,
  comparison,
  setBasket,
  compareItems,
  setView,
  showToast,
  addItemsToPantry,
}: UseHistoryOptions) {
  const [history, setHistory] = useState<SavedPlan[]>(loadHistory);
  const [confirmed, setConfirmed] = useState<ConfirmedPurchase[]>(loadConfirmedPurchases);
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | null>(null);
  const [confirmingPlan, setConfirmingPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveConfirmedPurchases(confirmed);
  }, [confirmed]);

  useEffect(() => {
    if (!highlightedPlanId) return;
    const timer = setTimeout(() => setHighlightedPlanId(null), 3800);
    return () => clearTimeout(timer);
  }, [highlightedPlanId]);

  const savePlan = () => {
    if (!comparison?.recommendedStore) return;
    const rec = comparison.recommendedStore;
    const signature = planItemsSignature(basket);
    const duplicate = history.find(
      (p) => p.store === rec.store.label && p.total === rec.total && savedPlanSignature(p) === signature,
    );
    if (duplicate) {
      showToast('Ese plan ya está en el historial');
      setHighlightedPlanId(duplicate.id);
      setView('history');
      return;
    }
    const now = new Date();
    const saved: SavedPlan = {
      id: String(Date.now()),
      date: now.toLocaleString('es-CL', {dateStyle: 'short', timeStyle: 'short'}),
      createdAt: now.toISOString(),
      snapshotDate: SNAPSHOT_FECHA,
      total: rec.total,
      store: rec.store.label,
      items: rec.pricedItems,
      savings: comparison.estimatedSavings,
      status: 'pending',
      lines: basket.map((item) => ({...item})),
      recommendedLines: rec.lines.map((line) => ({...line})),
    };
    setHistory((current) => [saved, ...current]);
    setHighlightedPlanId(saved.id);
    showToast('Plan guardado en el historial');
    setView('history');
  };

  const repeatPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      showToast('Ese plan no tiene líneas guardadas');
      return;
    }
    setBasket(plan.lines.map((item) => ({...item})));
    showToast('Compra restaurada desde el historial');
    setView('plan');
  };

  const compareSavedPlan = (plan: SavedPlan) => {
    if (!plan.lines?.length) {
      showToast('Ese plan no tiene líneas guardadas');
      return;
    }
    const lines = plan.lines.map((item) => ({...item}));
    setBasket(lines);
    compareItems(lines);
  };

  const deletePlan = (planId: string) => {
    setHistory((current) => current.filter((plan) => plan.id !== planId));
    showToast('Plan eliminado');
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('Historial vaciado');
  };

  const updatePlanStatus = (planId: string, status: PlanStatus) => {
    setHistory((current) => current.map((plan) =>
      plan.id === planId ? {...plan, status} : plan,
    ));
    showToast(`Estado actualizado: ${PLAN_STATUS_LABELS[status]}`);
  };

  const confirmPurchase = (plan: SavedPlan, data: ConfirmPurchaseData) => {
    const estimatedTotal = plan.total;
    const estimatedSavings = plan.savings ?? 0;
    const confirmedSavings = estimatedSavings + (estimatedTotal - data.realTotal);
    const purchase: ConfirmedPurchase = {
      id: String(Date.now()),
      planId: plan.id,
      store: plan.store,
      purchaseDate: data.purchaseDate,
      estimatedTotal,
      realTotal: data.realTotal,
      estimatedSavings,
      confirmedSavings,
      items: data.items,
      createdAt: new Date().toISOString(),
    };
    setConfirmed((current) => [purchase, ...current]);
    setHistory((current) => current.map((p) => (p.id === plan.id ? {...p, status: 'purchased'} : p)));
    if (data.addToPantry) {
      addItemsToPantry(data.items);
    }
    setConfirmingPlan(null);
    showToast('Compra confirmada y registrada');
  };

  return {
    history,
    confirmed,
    highlightedPlanId,
    confirmingPlan,
    setHistory,
    setConfirmingPlan,
    savePlan,
    repeatPlan,
    compareSavedPlan,
    deletePlan,
    clearHistory,
    updatePlanStatus,
    confirmPurchase,
  };
}
