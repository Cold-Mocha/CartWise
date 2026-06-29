import {Store} from 'lucide-react';
import type {StoreComparison} from '../../domain/types';
import {money, plural} from '../../lib/format';
import {ComparisonLineTable} from './ComparisonLineTable';

export function StoreComparisonCard({
  store,
  totalItems,
  isRecommended,
}: {
  store: StoreComparison;
  totalItems: number;
  isRecommended: boolean;
}) {
  const included = store.lines.filter((line) => line.price !== null);
  const missing = store.lines.filter((line) => line.price === null);
  const availableIncluded = included.filter((line) => line.available).length;
  const outOfStock = included.length - availableIncluded;
  const seg = (n: number) => `${totalItems ? (n / totalItems) * 100 : 0}%`;

  return (
    <article className={`cw-store-card${isRecommended ? ' recommended' : ''}`}>
      <div className="cw-store-head">
        <div>
          <span>{store.store.sitio_web}</span>
          <h2>{store.store.label}</h2>
        </div>
        {isRecommended ? <span className="cw-store-tag">Recomendada</span> : <Store size={22} aria-hidden="true" />}
      </div>
      <div className="cw-store-total">{store.pricedItems === 0 ? '—' : money(store.total)}</div>
      <div className="cw-coverage">
        {plural(store.pricedItems, 'producto')} de {plural(totalItems, 'producto')} con precio
        {outOfStock > 0 ? ` · ${plural(outOfStock, 'agotado')}` : ''}
      </div>
      <div
        className="cw-coverage-bar stacked"
        role="img"
        aria-label={`Cobertura: ${availableIncluded} con precio disponible, ${outOfStock} agotados, ${missing.length} sin precio, de ${totalItems}`}
      >
        {availableIncluded > 0 && <span className="seg in" style={{width: seg(availableIncluded)}} />}
        {outOfStock > 0 && <span className="seg out" style={{width: seg(outOfStock)}} />}
        {missing.length > 0 && <span className="seg miss" style={{width: seg(missing.length)}} />}
      </div>
      <p className="cw-store-why">
        {isRecommended
          ? 'Recomendada por mayor cobertura y menor total entre tiendas comparables.'
          : missing.length
            ? `${plural(missing.length, 'producto')} sin precio reduce la confianza del total.`
            : 'Compra completa en esta tienda.'}
      </p>
      <ComparisonLineTable storeId={store.store.id} lines={included} title="Incluidos en el total" />
      <ComparisonLineTable storeId={store.store.id} lines={missing} title="Sin precio en esta tienda" muted />
    </article>
  );
}
