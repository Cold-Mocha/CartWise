import type {BasketItem, PantryItem, SearchItem} from '../../domain/types';
import {Hero} from '../../components/ui';
import {ProductSearch} from '../products/ProductSearch';
import {BasketPanel} from './BasketPanel';

export function PlanBuilder({
  basket,
  pantry,
  onAdd,
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
  onAdd: (item: SearchItem) => void;
  onQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (item: BasketItem) => void;
  onSwitchToGeneric: (item: BasketItem) => void;
  onClear: () => void;
  onCompare: () => void;
  onSaveList: () => void;
  comparing: boolean;
}) {
  return (
    <div className="cw-stack">
      <Hero
        title="Prepara una compra para comparar"
        subtitle="Agrega los productos que quieres comparar y ajusta sus cantidades."
      />
      <section className="cw-grid-2 wide-left">
        <ProductSearch onAdd={onAdd} />
        <BasketPanel
          basket={basket}
          pantry={pantry}
          onQuantity={onQuantity}
          onRemove={onRemove}
          onSwitchToGeneric={onSwitchToGeneric}
          onClear={onClear}
          onCompare={onCompare}
          onSaveList={onSaveList}
          comparing={comparing}
        />
      </section>
    </div>
  );
}
