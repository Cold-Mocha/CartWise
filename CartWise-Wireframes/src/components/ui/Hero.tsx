import type {ReactNode} from 'react';

export function Hero({title, subtitle, action}: {title: string; subtitle: string; action?: ReactNode}) {
  return (
    <section className="cw-hero">
      <div>
        <span className="cw-kicker">Cartwise web</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </section>
  );
}
