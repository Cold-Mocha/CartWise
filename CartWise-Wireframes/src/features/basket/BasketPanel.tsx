import {Fragment, useRef} from 'react';
import {ListChecks} from 'lucide-react';
import type {BasketItem} from '../../domain/types';
import {money, plural} from '../../lib/format';
import {EmptyState, PanelHeader} from '../../components/ui';
import {BasketItemRow} from './BasketItemRow';

export function BasketPanel({
  basket,
  onQuantity,
  onRemove,
  onSwitchToGeneric,
  onClear,
  onCompare,
  onSaveList,
  comparing,
}: {
  basket: BasketItem[];
  onQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (item: BasketItem) => void;
  onSwitchToGeneric: (item: BasketItem) => void;
  onClear: () => void;
  onCompare: () => void;
  onSaveList: () => void;
  comparing: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLButtonElement>(null);
  const units = basket.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = basket.reduce((sum, item) => sum + (item.precio_min ?? 0) * item.quantity, 0);
  const hasEstimate = basket.some((item) => item.precio_min != null);

  const handleRemove = (item: BasketItem) => {
    const willHaveItems = basket.length > 1;
    onRemove(item);
    requestAnimationFrame(() => {
      if (willHaveItems) compareRef.current?.focus();
      else sectionRef.current?.focus();
    });
  };

  return (
    <section className="cw-panel sticky" ref={sectionRef} tabIndex={-1} aria-label="Compra pendiente">
      <div className="cw-panel-headrow">
        <PanelHeader title="Compra pendiente" subtitle={`${plural(basket.length, 'producto')} · ${plural(units, 'unidad', 'unidades')}`} />
        {basket.length > 0 && (
          <button type="button" className="cw-ghost-btn cw-ghost-sm" onClick={onClear}>Vaciar</button>
        )}
      </div>
      {basket.length ? (
        <>
          <div className="cw-basket-list" role="list">
            {basket.map((item) => (
              <Fragment key={`${item.kind}-${item.id}`}>
                <BasketItemRow
                  item={item}
                  onQuantity={onQuantity}
                  onRemove={handleRemove}
                  onSwitchToGeneric={onSwitchToGeneric}
                />
              </Fragment>
            ))}
          </div>
          {hasEstimate && (
            <div className="cw-basket-subtotal">
              <span>Estimado (precio mínimo)</span>
              <strong>{money(subtotal)}</strong>
            </div>
          )}
          <p className="cw-basket-note">
            Estimación con el precio más bajo de cada producto. Se recalcula por tienda al comparar.
          </p>
          <button ref={compareRef} type="button" className="cw-primary-btn" onClick={onCompare} disabled={comparing}>
            {comparing ? 'Comparando...' : 'Comparar supermercados'}
          </button>
          <button type="button" className="cw-ghost-btn cw-full-btn" onClick={onSaveList}>
            <ListChecks size={16} aria-hidden="true" /> Guardar como lista
          </button>
        </>
      ) : (
        <EmptyState text="Tu compra pendiente está vacía." />
      )}
    </section>
  );
}
