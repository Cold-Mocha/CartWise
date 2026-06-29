import {Fragment, useState} from 'react';
import {Plus} from 'lucide-react';
import type {PantryItem, PantryItemDraft, View} from '../../domain/types';
import {plural} from '../../lib/format';
import {EmptyState, Hero, PanelHeader} from '../../components/ui';
import {AddPantryItemModal} from './AddPantryModal';
import {PantryItemRow} from './PantryItemRow';

export function PantryView({
  pantry,
  onAdd,
  onQuantity,
  onConsume,
  onNavigate,
}: {
  pantry: PantryItem[];
  onAdd: (data: PantryItemDraft) => void;
  onQuantity: (id: string, quantity: number) => void;
  onConsume: (id: string) => void;
  onNavigate: (view: View) => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="cw-stack">
      <Hero
        title="Almacén del hogar"
        subtitle="Productos que tienes en casa. Evita comprar de nuevo algo que ya tienes."
        action={
          <button type="button" className="cw-primary-btn" onClick={() => setAdding(true)}>
            <Plus size={18} aria-hidden="true" /> Agregar producto
          </button>
        }
      />
      {pantry.length ? (
        <div className="cw-panel">
          <PanelHeader title="Productos disponibles" subtitle={plural(pantry.length, 'producto')} />
          <ul className="cw-pantry-list" role="list">
            {pantry.map((item) => (
              <Fragment key={item.id}>
                <PantryItemRow item={item} onQuantity={onQuantity} onConsume={onConsume} />
              </Fragment>
            ))}
          </ul>
        </div>
      ) : (
        <div className="cw-panel">
          <EmptyState text="Tu almacén está vacío. Agrega productos que ya tienes o envíalos al confirmar una compra." />
          <div className="cw-panel-actions">
            <button type="button" className="cw-primary-btn" onClick={() => setAdding(true)}>Agregar producto</button>
            <button type="button" className="cw-ghost-btn" onClick={() => onNavigate('history')}>Confirmar una compra</button>
          </div>
        </div>
      )}
      {adding && <AddPantryItemModal onClose={() => setAdding(false)} onAdd={onAdd} />}
    </div>
  );
}
