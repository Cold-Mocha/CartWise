import {Fragment, useRef} from 'react';
import {AlertTriangle, ListChecks} from 'lucide-react';
import type {BasketItem, PantryItem} from '../../domain/types';
import {money, plural} from '../../lib/format';
import {EmptyState, PanelHeader} from '../../components/ui';
import {BasketItemRow} from './BasketItemRow';

const normalize = (value: string) => value.trim().toLowerCase();

export function BasketPanel({
  basket,
  pantry,
  onQuantity,
  onRemove,
  onSwitchToGeneric,
  onClear,
  onCompare,
  onSaveList,
  comparing,
}: {
  basket: BasketItem[];
  pantry: PantryItem[];
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
  const pantryNames = new Set(pantry.map((p) => normalize(p.productName)));
  const pantryIds = new Set(pantry.map((p) => p.productId).filter((id): id is number => id != null));
  const inPantry = (item: BasketItem) => pantryIds.has(item.id) || pantryNames.has(normalize(item.nombre));
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
                {inPantry(item) && (
                  <p className="cw-basket-pantry-warn" role="note">
                    <AlertTriangle size={14} aria-hidden="true" />
                    Este producto ya está registrado en tu despensa
                  </p>
                )}
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
