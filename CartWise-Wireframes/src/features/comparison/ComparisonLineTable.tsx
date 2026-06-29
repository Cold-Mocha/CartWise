import type {CompareLine} from '../../domain/types';
import {money} from '../../lib/format';
import {ProductImage} from '../products/ProductImage';

export function ComparisonLineTable({
  storeId,
  lines,
  title,
  muted,
}: {
  storeId: number;
  lines: CompareLine[];
  title: string;
  muted?: boolean;
}) {
  if (!lines.length) return null;

  return (
    <div className={muted ? 'cw-lines muted' : 'cw-lines'}>
      <span className="cw-lines-title">{title}</span>
      {lines.map((line) => (
        <div className="cw-line" key={`${storeId}-${line.kind}-${line.itemId}`}>
          <ProductImage ean={line.ean} alt={line.name} size={30} />
          <span className="cw-line-name">
            {line.name}{line.quantity > 1 && <em> ×{line.quantity}</em>}
            {line.kind === 'generic' && line.matchedProductName && (
              <small>Se comparó: {line.matchedProductName}</small>
            )}
            {line.kind === 'generic' && line.unitPrice != null && (
              <small>{money(line.unitPrice)} por {line.unitBase === 'un' ? 'unidad' : line.unitBase || 'unidad base'}</small>
            )}
            {!line.available && !muted && <small className="cw-flag-out">Agotado</small>}
            {line.url && !muted && (
              <a className="cw-line-link" href={line.url} target="_blank" rel="noreferrer">
                Ver en tienda
              </a>
            )}
          </span>
          <strong className={muted ? 'cw-line-missing' : undefined}>
            {muted ? 'Sin precio' : money(line.lineTotal)}
          </strong>
        </div>
      ))}
    </div>
  );
}
