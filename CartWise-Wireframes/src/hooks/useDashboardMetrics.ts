import {PLAN_STATUS_LABELS} from '../domain/constants';
import type {BasketItem, ConfirmedPurchase, SavedPlan} from '../domain/types';
import {money, monthKey, plural} from '../lib/format';

export function useDashboardMetrics({
  basket,
  history,
  confirmed,
  budget,
}: {
  basket: BasketItem[];
  history: SavedPlan[];
  confirmed: ConfirmedPurchase[];
  budget: number;
}) {
  const month = monthKey();
  const monthConfirmed = confirmed.filter((c) => monthKey(c.purchaseDate) === month);
  const gastoMes = monthConfirmed.reduce((s, c) => s + (c.realTotal || 0), 0);
  const ahorroConfirmado = monthConfirmed.reduce((s, c) => s + (c.confirmedSavings || 0), 0);
  const monthPlans = history.filter((p) => monthKey(p.createdAt) === month);
  const ahorroEstimado = monthPlans.reduce((s, p) => s + (p.savings || 0), 0);
  const presupuestoRestante = budget > 0 ? budget - gastoMes : null;
  const pendingPlan = history.find((p) => p.status === 'pending');
  const basketUnits = basket.reduce((sum, item) => sum + item.quantity, 0);
  const recentPurchases = [...confirmed]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const alertas: string[] = [];
  if (budget > 0) {
    const pct = Math.round((gastoMes / budget) * 100);
    alertas.push(`Gastaste ${pct}% de tu presupuesto mensual. Te quedan ${money(budget - gastoMes)} para el mes.`);
  }
  if (pendingPlan) {
    alertas.push(`Tienes un plan pendiente en ${pendingPlan.store}. Ahorro estimado: ${money(pendingPlan.savings)}.`);
  }
  if (basket.length > 0) {
    alertas.push(`Tienes una compra pendiente con ${plural(basket.length, 'producto')} sin comparar.`);
  }

  return {
    month,
    monthConfirmed,
    gastoMes,
    ahorroConfirmado,
    ahorroEstimado,
    presupuestoRestante,
    pendingPlan,
    basketUnits,
    recentPurchases,
    alertas,
    planStatusLabels: PLAN_STATUS_LABELS,
  };
}
