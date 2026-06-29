import type {ConfirmedPurchase} from '../../domain/types';
import {money} from '../../lib/format';
import {EmptyState, PanelHeader} from '../../components/ui';

export function CategorySpendingChart({purchases}: {purchases: ConfirmedPurchase[]}) {
  const totals = new Map<string, number>();
  purchases.forEach((p) => {
    p.items.forEach((it) => {
      const cat = it.category || 'Otros';
      const amount = (it.paidPrice || 0) * (it.quantity || 1);
      totals.set(cat, (totals.get(cat) || 0) + amount);
    });
  });
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...rows.map(([, v]) => v), 1);
  return (
    <div className="cw-panel">
      <PanelHeader title="Gasto por categoría" subtitle="Distribución del mes" />
      {rows.length ? (
        <ul className="cw-hbar-chart" role="list">
          {rows.map(([cat, value]) => (
            <li key={cat}>
              <span className="cw-hbar-label">{cat}</span>
              <span className="cw-hbar-track"><span style={{width: `${Math.round((value / max) * 100)}%`}} /></span>
              <span className="cw-hbar-value">{money(value)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState text="Sin datos de categorías todavía. Aparece al confirmar compras con precios." />
      )}
    </div>
  );
}
