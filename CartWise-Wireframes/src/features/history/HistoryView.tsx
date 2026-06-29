import {Fragment, useEffect, useState} from 'react';
import {CheckCircle2, Eye, ListChecks, RefreshCcw, RotateCcw, Trash2} from 'lucide-react';
import {PLAN_STATUS_LABELS, SNAPSHOT_FECHA} from '../../domain/constants';
import type {PlanStatus, SavedPlan} from '../../domain/types';
import {money, plural} from '../../lib/format';
import {EmptyState, Hero, PanelHeader} from '../../components/ui';
import {HistoryRow} from './HistoryRow';
import {PlanDetail} from './PlanDetail';

export function HistoryView({
  history,
  highlightedPlanId,
  onRepeat,
  onCompare,
  onDelete,
  onClear,
  onStatusChange,
  onConfirm,
  onSaveAsList,
}: {
  history: SavedPlan[];
  highlightedPlanId: string | null;
  onRepeat: (plan: SavedPlan) => void;
  onCompare: (plan: SavedPlan) => void;
  onDelete: (planId: string) => void;
  onClear: () => void;
  onStatusChange: (planId: string, status: PlanStatus) => void;
  onConfirm: (plan: SavedPlan) => void;
  onSaveAsList: (plan: SavedPlan) => void;
}) {
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (highlightedPlanId) setOpenPlanId(highlightedPlanId);
  }, [highlightedPlanId]);

  return (
    <div className="cw-stack">
      <Hero title="Tu historial" subtitle="Los planes que has guardado para volver a revisarlos." />
      <p className="cw-compare-note">
        Los totales corresponden a los precios actualizados al {SNAPSHOT_FECHA}; pueden haber cambiado en tienda.
      </p>
      <section className="cw-panel">
        <div className="cw-panel-headrow">
          <PanelHeader title="Planes guardados" subtitle={plural(history.length, 'plan', 'planes')} />
          {history.length > 0 && (
            <button type="button" className="cw-ghost-btn cw-ghost-sm" onClick={onClear}>
              <Trash2 size={14} aria-hidden="true" />
              Vaciar
            </button>
          )}
        </div>
        {history.length ? (
          <>
            <div className="cw-table-wrap">
              <table className="cw-history-table">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Tienda</th>
                    <th scope="col">Productos</th>
                    <th scope="col">Total</th>
                    <th scope="col">Ahorro</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((plan) => (
                    <Fragment key={plan.id}>
                      <HistoryRow
                        plan={plan}
                        highlightedPlanId={highlightedPlanId}
                        openPlanId={openPlanId}
                        onOpenPlan={setOpenPlanId}
                        onRepeat={onRepeat}
                        onCompare={onCompare}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                        onConfirm={onConfirm}
                        onSaveAsList={onSaveAsList}
                      />
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cw-history-cards" role="list">
              {history.map((plan) => {
                const status = plan.status || 'pending';
                const isOpen = openPlanId === plan.id;
                const hasLines = !!plan.lines?.length;
                return (
                  <article
                    className={highlightedPlanId === plan.id ? 'cw-history-card highlighted' : 'cw-history-card'}
                    key={`card-${plan.id}`}
                    role="listitem"
                  >
                    <div className="cw-history-card-head">
                      <div>
                        <span>{plan.date}</span>
                        <strong>{plan.store}</strong>
                      </div>
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
                    </div>
                    <dl className="cw-history-facts">
                      <div><dt>Productos</dt><dd>{plan.items}</dd></div>
                      <div><dt>Total</dt><dd>{money(plan.total)}</dd></div>
                      <div><dt>Ahorro</dt><dd>{money(plan.savings)}</dd></div>
                      <div><dt>Actualizado</dt><dd>{plan.snapshotDate || SNAPSHOT_FECHA}</dd></div>
                    </dl>
                    <div className="cw-history-actions">
                      <button
                        type="button"
                        className="cw-icon-btn"
                        onClick={() => setOpenPlanId(isOpen ? null : plan.id)}
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
                    {isOpen && <PlanDetail plan={plan} />}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState text="Guarda un plan desde la comparacion para verlo aqui." />
        )}
      </section>
    </div>
  );
}
