import type {SearchItem} from '../../domain/types';
import {Hero} from '../../components/ui';
import {ProductSearch} from './ProductSearch';

export function PriceExplorer({onAdd}: {onAdd: (item: SearchItem) => void}) {
  return (
    <div className="cw-stack">
      <Hero
        title="Explora precios reales"
        subtitle="Busca por nombre o marca. Verás el mismo producto y también opciones comparables por unidad."
      />
      <ProductSearch onAdd={onAdd} variant="explore" />
    </div>
  );
}
