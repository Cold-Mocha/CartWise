import type {BasketItem, SearchItem} from '../../domain/types';
import {Hero} from '../../components/ui';
import {ProductSearch} from '../products/ProductSearch';
import {BasketPanel} from './BasketPanel';

export function PlanBuilder({
  basket,
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
