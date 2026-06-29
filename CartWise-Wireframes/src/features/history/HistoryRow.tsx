import {CheckCircle2, Eye, ListChecks, RefreshCcw, RotateCcw, Trash2} from 'lucide-react';
import {PLAN_STATUS_LABELS} from '../../domain/constants';
import type {PlanStatus, SavedPlan} from '../../domain/types';
import {money} from '../../lib/format';
import {PlanDetail} from './PlanDetail';

export function HistoryRow({
  plan,
  highlightedPlanId,
  openPlanId,
  onOpenPlan,
  onRepeat,
  onCompare,
  onDelete,
  onStatusChange,
  onConfirm,
  onSaveAsList,
}: {
  plan: SavedPlan;
  highlightedPlanId: string | null;
  openPlanId: string | null;
  onOpenPlan: (id: string | null) => void;
  onRepeat: (plan: SavedPlan) => void;
  onCompare: (plan: SavedPlan) => void;
  onDelete: (planId: string) => void;
  onStatusChange: (planId: string, status: PlanStatus) => void;
  onConfirm: (plan: SavedPlan) => void;
  onSaveAsList: (plan: SavedPlan) => void;
}) {
  const status = plan.status || 'pending';
  const isOpen = openPlanId === plan.id;
  const hasLines = !!plan.lines?.length;

  return (
    <>
      <tr className={highlightedPlanId === plan.id ? 'highlighted' : ''}>
        <td>{plan.date}</td>
        <td>
          <select
            className={`cw-status-select ${status}`}
            value={status}
            onChange={(event) => onStatusChange(plan.id, event.target.value as PlanStatus)}
            aria-label={`Estado del plan del ${plan.date}`}
          >
            {Object.entries(PLAN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td>{plan.store}</td>
        <td>{plan.items}</td>
        <td>{money(plan.total)}</td>
        <td>{money(plan.savings)}</td>
        <td>
          <div className="cw-history-actions">
            <button
              type="button"
              className="cw-icon-btn"
              onClick={() => onOpenPlan(isOpen ? null : plan.id)}
              aria-expanded={isOpen}
              aria-label={`Ver detalle del plan de ${plan.store}`}
              title="Ver detalle"
            >
              <Eye size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cw-icon-btn"
              onClick={() => onRepeat(plan)}
              disabled={!hasLines}
              aria-label={`Repetir compra de ${plan.store}`}
              title="Repetir compra"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cw-icon-btn"
              onClick={() => onCompare(plan)}
              disabled={!hasLines}
              aria-label={`Comparar de nuevo el plan de ${plan.store}`}
              title="Comparar de nuevo"
            >
              <RefreshCcw size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cw-icon-btn"
              onClick={() => onConfirm(plan)}
              disabled={status === 'purchased'}
              aria-label={`Confirmar compra del plan de ${plan.store}`}
              title={status === 'purchased' ? 'Compra ya confirmada' : 'Confirmar compra'}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cw-icon-btn"
              onClick={() => onSaveAsList(plan)}
              disabled={!hasLines}
              aria-label={`Guardar como lista el plan de ${plan.store}`}
              title="Guardar como lista"
            >
              <ListChecks size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cw-icon-btn danger"
              onClick={() => onDelete(plan.id)}
              aria-label={`Eliminar plan de ${plan.store}`}
              title="Eliminar"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr className="cw-history-detail-row">
          <td colSpan={7}>
            <PlanDetail plan={plan} showSnapshot />
          </td>
        </tr>
      )}
    </>
  );
}
