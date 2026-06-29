import {useState} from 'react';
import {Package} from 'lucide-react';

export function ProductImage({ean, alt, size = 44}: {ean?: string | null; alt: string; size?: number}) {
  const [failed, setFailed] = useState(false);
  const style = {width: size, height: size};
  if (!ean || failed) {
    return (
      <span className="cw-prod-img placeholder" style={style} aria-hidden="true">
        <Package size={Math.round(size * 0.5)} aria-hidden="true" />
      </span>
    );
  }
  return (
    <img
      className="cw-prod-img"
      style={style}
      src={`/images/products/${ean}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
