import type {ConfirmedPurchase} from '../../domain/types';
import {EmptyState, PanelHeader} from '../../components/ui';

export function MonthlySpendingChart({purchases, budget}: {purchases: ConfirmedPurchase[]; budget: number}) {
  const weeks = [0, 0, 0, 0, 0];
  purchases.forEach((p) => {
    const day = new Date(p.purchaseDate).getDate();
    const idx = Math.min(4, Math.floor((day - 1) / 7));
    weeks[idx] += p.realTotal || 0;
  });
  const max = Math.max(...weeks, budget > 0 ? budget / 4 : 0, 1);
  const hasData = purchases.length > 0;
  return (
    <div className="cw-panel">
      <PanelHeader title="Gasto del mes por semana" subtitle="Compras confirmadas" />
      {hasData ? (
        <div className="cw-bar-chart" role="img" aria-label="Gasto por semana del mes">
          {weeks.map((value, i) => (
            <div key={i} className="cw-bar-col">
              <div className="cw-bar-track">
                <span className="cw-bar-fill" style={{height: `${Math.round((value / max) * 100)}%`}} />
              </div>
              <span className="cw-bar-label">S{i + 1}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="Sin compras confirmadas este mes. El gráfico se llena al confirmar compras." />
      )}
    </div>
  );
}
