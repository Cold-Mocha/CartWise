import {Fragment} from 'react';
import {CheckCircle2} from 'lucide-react';
import {SNAPSHOT_FECHA} from '../../domain/constants';
import type {BasketComparison} from '../../domain/types';
import {money, plural} from '../../lib/format';
import {EmptyState, Hero} from '../../components/ui';
import {StoreComparisonCard} from './StoreComparisonCard';

export function ComparisonView({
  comparison,
  onBack,
  onSave,
}: {
  comparison: BasketComparison | null;
  onBack: () => void;
  onSave: () => void;
}) {
  if (!comparison) {
    return (
      <div className="cw-panel">
        <EmptyState text="Todavia no hay una comparacion activa." />
        <button type="button" className="cw-primary-btn" onClick={onBack}>Volver a la compra</button>
      </div>
    );
  }

  const totalItems = comparison.items.length;
  const recommended = comparison.recommendedStore;
  const sortedStores = [...comparison.stores].sort((a, b) =>
    a.missingItems - b.missingItems || a.total - b.total,
  );

  return (
    <div className="cw-stack">
      <Hero
        title="Comparación por supermercado"
        subtitle="El recomendado prioriza completar más productos y luego menor total."
        action={
          <div className="cw-hero-actions">
            <button type="button" className="cw-ghost-btn" onClick={onBack}>Volver y editar compra</button>
            <button type="button" className="cw-primary-btn" onClick={onSave}>Guardar plan</button>
          </div>
        }
      />
      <p className="cw-sr-only" aria-live="polite">
        {recommended
          ? `Comparación lista. Tienda recomendada ${recommended.store.label}, total ${money(recommended.total)}.`
          : 'Comparación lista. Ninguna tienda tiene precios para esta compra.'}
      </p>
      {recommended && (
        <section className="cw-recommendation">
          <CheckCircle2 size={28} aria-hidden="true" />
          <div>
            <span>Mejor opción</span>
            <strong>{recommended.store.label}</strong>
            <p>
              {plural(recommended.pricedItems, 'producto')} de {plural(totalItems, 'producto')} con precio
              {recommended.missingItems > 0 ? ` · ${plural(recommended.missingItems, 'producto')} sin precio` : ''}
            </p>
            <p>
              {comparison.estimatedSavings > 0
                ? `Ahorro estimado frente a la tienda más cara con la misma cobertura: ${money(comparison.estimatedSavings)}`
                : 'Sin otra tienda con la misma cobertura para estimar ahorro.'}
            </p>
          </div>
          <div>{money(recommended.total)}</div>
        </section>
      )}
      <p className="cw-compare-note">
        Solo comparamos productos con precio disponible en cada tienda. Precios actualizados al {SNAPSHOT_FECHA};
        pueden cambiar en tienda.
      </p>
      <section className="cw-store-grid">
        {sortedStores.map((store) => (
          <Fragment key={store.store.id}>
            <StoreComparisonCard
              store={store}
              totalItems={totalItems}
              isRecommended={recommended?.store.id === store.store.id}
            />
          </Fragment>
        ))}
      </section>
    </div>
  );
}
