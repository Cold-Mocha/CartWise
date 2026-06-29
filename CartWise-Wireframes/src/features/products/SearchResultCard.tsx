import {useState} from 'react';
import type {SearchItem} from '../../domain/types';
import {isAvailableFlag} from '../../lib/basket';
import {money, plural} from '../../lib/format';
import {ProductImage} from './ProductImage';

export function SearchResultCard({item, onAdd, compact}: {item: SearchItem; onAdd: (item: SearchItem) => void; compact?: boolean}) {
  const [expanded, setExpanded] = useState(false);
  const isExact = item.kind === 'product';
  const badgeTitle = isExact
    ? 'Mismo producto: idéntico código de barras.'
    : 'Sustituto equivalente por contenido; revísalo antes de comprar.';
  const tiendas = item.n_tiendas ?? 0;
  const unitLabel = item.unidad_base ? `por ${item.unidad_base === 'un' ? 'unidad' : `kg/l ref.`}` : '';
  const longName = item.nombre.length > 78;
  return (
    <article className="cw-result-card" role="listitem">
      <ProductImage ean={item.ean} alt={item.nombre} size={compact ? 40 : 52} />
      <div>
        <div className="cw-badges">
          <span className={isExact ? 'cw-badge exact' : 'cw-badge generic'} title={badgeTitle}>
            {item.match_label}
          </span>
          {tiendas > 0 && <span className="cw-badge">{plural(tiendas, 'tienda')}</span>}
          {isAvailableFlag(item.precio_min_disponible) && <span className="cw-badge available">Disponible</span>}
        </div>
        <h3 className={expanded ? 'cw-result-name' : 'cw-result-name truncated'} title={item.nombre}>{item.nombre}</h3>
        {longName && !compact && (
          <button type="button" className="cw-link-btn cw-expand-name" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Ver menos' : 'Ver nombre completo'}
          </button>
        )}
        {!compact && (
          <p>
            {[item.marca, item.categoria, item.ean].filter(Boolean).join(' · ') || 'Producto comparable'}
          </p>
        )}
      </div>
      <div className="cw-result-side">
        <strong>{money(item.precio_min)}</strong>
        {item.precio_min_store_label && (
          <span className="cw-price-store">Menor en {item.precio_min_store_label}</span>
        )}
        {item.kind === 'generic' && item.precio_unitario_min != null && (
          <span>{money(item.precio_unitario_min)} {unitLabel}</span>
        )}
        {!!item.diferencia && <span>Ahorro ref. {money(item.diferencia)}</span>}
        <button
          type="button"
          className="cw-small-btn"
          onClick={() => onAdd(item)}
          aria-label={`Agregar ${item.nombre} a tu compra`}
        >
          Agregar
        </button>
      </div>
    </article>
  );
}
