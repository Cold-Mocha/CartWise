import {SNAPSHOT_FECHA} from '../../domain/constants';
import type {SavedPlan} from '../../domain/types';
import {EmptyState} from '../../components/ui';

export function PlanDetail({plan, showSnapshot = false}: {plan: SavedPlan; showSnapshot?: boolean}) {
  const hasLines = !!plan.lines?.length;
  return (
    <div className="cw-history-detail">
      {hasLines ? (
        <>
          {showSnapshot && (
            <div>
              <span>Actualizado</span>
              <strong>{plan.snapshotDate || SNAPSHOT_FECHA}</strong>
            </div>
          )}
          <div className="cw-history-lines" role="list">
            {plan.lines?.map((line) => (
              <div role="listitem" key={`${plan.id}-${line.kind}-${line.id}`}>
                <span>
                  {line.nombre}
                  {line.quantity > 1 && <em> ×{line.quantity}</em>}
                </span>
                <strong>{line.match_label}</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState text="Este plan fue guardado antes de almacenar líneas accionables." />
      )}
    </div>
  );
}
