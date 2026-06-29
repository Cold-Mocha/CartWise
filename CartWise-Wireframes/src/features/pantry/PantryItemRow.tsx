import {Check} from 'lucide-react';
import type {PantryItem} from '../../domain/types';

export function PantryItemRow({
  item,
  onQuantity,
  onConsume,
}: {
  item: PantryItem;
  onQuantity: (id: string, quantity: number) => void;
  onConsume: (id: string) => void;
}) {
  return (
    <li className="cw-pantry-row">
      <div className="cw-pantry-info">
        <strong>{item.productName}</strong>
        <span className="cw-muted">
          {item.category || 'Sin categoría'}
          {item.source === 'confirmed_purchase' ? ' · de una compra' : ' · agregado a mano'}
        </span>
      </div>
      <div className="cw-qty" role="group" aria-label={`Cantidad de ${item.productName}`}>
        <button type="button" onClick={() => onQuantity(item.id, item.quantity - 1)} aria-label="Restar uno">−</button>
        <span>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
        <button type="button" onClick={() => onQuantity(item.id, item.quantity + 1)} aria-label="Sumar uno">+</button>
      </div>
      <button type="button" className="cw-ghost-btn cw-ghost-sm" onClick={() => onConsume(item.id)}>
        <Check size={14} aria-hidden="true" /> Consumido
      </button>
    </li>
  );
}
