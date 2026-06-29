import {useState} from 'react';
import {currentMonthLabel, money} from '../../lib/format';
import {EmptyState, PanelHeader} from '../../components/ui';

export function BudgetCard({budget, gastoMes, onBudgetChange}: {budget: number; gastoMes: number; onBudgetChange: (value: number) => void}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget || ''));
  const pct = budget > 0 ? Math.min(100, Math.round((gastoMes / budget) * 100)) : 0;
  const save = () => {
    const value = Math.max(0, Math.round(Number(draft) || 0));
    onBudgetChange(value);
    setEditing(false);
  };
  return (
    <div className="cw-panel cw-budget-card">
      <div className="cw-panel-headrow">
        <PanelHeader title="Presupuesto mensual de comida" subtitle={`Mes: ${currentMonthLabel()}`} />
        <button type="button" className="cw-link-btn" onClick={() => { setDraft(String(budget || '')); setEditing((v) => !v); }}>
          {editing ? 'Cancelar' : budget > 0 ? 'Editar' : 'Definir'}
        </button>
      </div>
      {editing ? (
        <div className="cw-budget-edit">
          <label htmlFor="cw-budget-input">Presupuesto en CLP</label>
          <input
            id="cw-budget-input"
            type="number"
            min={0}
            step={1000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="button" className="cw-primary-btn" onClick={save}>Guardar</button>
        </div>
      ) : budget > 0 ? (
        <>
          <p className="cw-budget-figure">{money(gastoMes)} <span>/ {money(budget)}</span></p>
          <div className="cw-budget-bar" role="img" aria-label={`Has gastado ${pct}% de tu presupuesto`}>
            <span style={{width: `${pct}%`}} className={pct >= 100 ? 'over' : ''} />
          </div>
          <p className="cw-muted">Te quedan {money(Math.max(0, budget - gastoMes))} para este mes.</p>
        </>
      ) : (
        <EmptyState text="Define un presupuesto mensual para seguir cuánto llevas gastado en comida." />
      )}
    </div>
  );
}
