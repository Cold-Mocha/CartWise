import type {ReactNode} from 'react';

export function MetricCard({label, value}: {label: string; value: ReactNode}) {
  return (
    <article className="cw-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
