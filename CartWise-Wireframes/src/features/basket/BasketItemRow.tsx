import type {BasketItem} from '../../domain/types';
import {ProductImage} from '../products/ProductImage';

export function BasketItemRow({
  item,
  onQuantity,
  onRemove,
  onSwitchToGeneric,
}: {
  item: BasketItem;
  onQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (item: BasketItem) => void;
  onSwitchToGeneric: (item: BasketItem) => void;
}) {
  return (
    <div className="cw-basket-row" role="listitem">
      <ProductImage ean={item.ean} alt={item.nombre} size={40} />
      <div>
        <strong>{item.nombre}</strong>
        <span>{item.match_label}</span>
        {item.kind === 'product' && item.generico_id && (
          <button
            type="button"
            className="cw-link-btn cw-row-action"
            onClick={() => onSwitchToGeneric(item)}
          >
            Cambiar por comparable
          </button>
        )}
      </div>
      <div className="cw-basket-actions">
        <div className="cw-qty" role="group" aria-label={`Cantidad de ${item.nombre}`}>
          <button
            type="button"
            onClick={() => onQuantity(item, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`Disminuir cantidad de ${item.nombre}`}
          >-</button>
          <span
            role="spinbutton"
            tabIndex={0}
            aria-label={`Cantidad de ${item.nombre}`}
            aria-valuemin={1}
            aria-valuenow={item.quantity}
            aria-live="polite"
            aria-atomic="true"
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onQuantity(item, item.quantity + 1);
              }
              if (event.key === 'ArrowDown' && item.quantity > 1) {
                event.preventDefault();
                onQuantity(item, item.quantity - 1);
              }
            }}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantity(item, item.quantity + 1)}
            aria-label={`Aumentar cantidad de ${item.nombre}`}
          >+</button>
        </div>
        <button
          type="button"
          className="cw-remove-btn"
          onClick={() => onRemove(item)}
          aria-label={`Quitar ${item.nombre} de tu compra`}
        >
          Quitar
        </button>
      </div>
    </div>
  );
}
