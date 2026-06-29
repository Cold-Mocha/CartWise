import {useEffect, useState} from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBasket,
  Store,
  Tag,
  TrendingUp,
} from 'lucide-react';
import {
  COMING_SOON_STORES,
  COVERED_STORES,
  SNAPSHOT_FECHA,
  TRANSPARENCY_SNAPSHOT,
} from '../../domain/constants';
import type {SearchItem} from '../../domain/types';
import {money, plural} from '../../lib/format';
import {getTopDeals} from '../../services/cartwiseApi';
import {EmptyState} from '../../components/ui';

export function PublicLanding({onDemo, onLogin}: {onDemo: () => void; onLogin: () => void}) {
  const [deals, setDeals] = useState<SearchItem[]>([]);

  useEffect(() => {
    getTopDeals(8)
      .then(setDeals)
      .catch(() => setDeals([]));
  }, []);

  return (
    <div className="cw-landing">
      <header className="cw-landing-nav">
        <div className="cw-brand">
          <div className="cw-logo">C</div>
          <strong>Cartwise</strong>
        </div>
        <div className="cw-landing-nav-actions">
          <button type="button" className="cw-ghost-btn" onClick={onLogin}>Iniciar sesión</button>
          <button type="button" className="cw-primary-btn" onClick={onDemo}>Probar como demo</button>
        </div>
      </header>

      <main id="cw-main">
        <section className="cw-hero-public">
          <div className="cw-hero-public-copy">
            <span className="cw-kicker">Compara y ahorra</span>
            <h1>Ahorra tiempo y dinero en cada compra</h1>
            <p>
              Cartwise compara el precio de tu compra de comida y bebida entre los
              supermercados chilenos integrados, para que sepas dónde te conviene comprar.
            </p>
            <div className="cw-hero-public-actions">
              <button type="button" className="cw-primary-btn" onClick={onDemo}>
                Probar como demo <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="cw-ghost-btn" onClick={onLogin}>Iniciar sesión</button>
            </div>
            <p className="cw-disclaimer-text">{TRANSPARENCY_SNAPSHOT}</p>
          </div>
        </section>

        <CoveredStoresSection />
        <OpportunitiesCarousel deals={deals} onDemo={onDemo} />
        <HowItWorksSection />
      </main>

      <footer className="cw-landing-foot">
        <PublicDataDisclaimer />
        <button type="button" className="cw-primary-btn" onClick={onDemo}>Entrar como demo</button>
      </footer>
    </div>
  );
}

export function CoveredStoresSection() {
  return (
    <section className="cw-landing-section" aria-labelledby="cw-covered-title">
      <h2 id="cw-covered-title">Supermercados actualmente comparados</h2>
      <p className="cw-section-lead">
        Comparamos productos de comida y bebida en supermercados integrados al último snapshot disponible.
      </p>
      <ul className="cw-store-logos" role="list">
        {COVERED_STORES.map((store) => (
          <li key={store} className="cw-store-logo">
            <Store size={22} aria-hidden="true" />
            <span>{store}</span>
          </li>
        ))}
      </ul>
      <p className="cw-coming-soon">Próximamente: {COMING_SOON_STORES.join(' · ')}</p>
    </section>
  );
}

export function OpportunitiesCarousel({deals, onDemo}: {deals: SearchItem[]; onDemo: () => void}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = deals.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [paused, count]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (!count) {
    return (
      <section className="cw-landing-section" aria-labelledby="cw-opp-title">
        <h2 id="cw-opp-title">Oportunidades destacadas</h2>
        <EmptyState text="Aún no hay diferencias destacadas para mostrar." />
      </section>
    );
  }

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section
      className="cw-landing-section"
      aria-labelledby="cw-opp-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <h2 id="cw-opp-title">Oportunidades destacadas</h2>
      <p className="cw-section-lead">
        Diferencias de precio relevantes entre tiendas para un mismo producto. No son
        necesariamente promociones.
      </p>
      <div className="cw-carousel" aria-roledescription="carrusel" aria-live="polite">
        <button
          type="button"
          className="cw-carousel-arrow"
          onClick={() => go(index - 1)}
          aria-label="Oportunidad anterior"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <OpportunityCard deal={deals[index]} onDemo={onDemo} position={index + 1} total={count} />
        <button
          type="button"
          className="cw-carousel-arrow"
          onClick={() => go(index + 1)}
          aria-label="Siguiente oportunidad"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="cw-carousel-dots" role="tablist" aria-label="Seleccionar oportunidad">
        {deals.map((deal, i) => (
          <button
            key={deal.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Oportunidad ${i + 1} de ${count}`}
            className={i === index ? 'active' : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}

function OpportunityCard({deal, onDemo, position, total}: {deal: SearchItem; onDemo: () => void; position: number; total: number}) {
  const diff = deal.diferencia ?? null;
  const pct = diff && deal.precio_max ? Math.round((diff / deal.precio_max) * 100) : null;
  return (
    <article className="cw-opp-card" aria-label={`Oportunidad ${position} de ${total}`}>
      <span className="cw-badge-diff"><TrendingUp size={13} aria-hidden="true" /> Diferencia destacada</span>
      <h3>{deal.nombre}</h3>
      {deal.categoria && <p className="cw-opp-cat">{deal.categoria}</p>}
      <dl className="cw-opp-prices">
        <div>
          <dt>Más barato{deal.precio_min_store_label ? `: ${deal.precio_min_store_label}` : ''}</dt>
          <dd className="cw-opp-low">{money(deal.precio_min)}</dd>
        </div>
        {diff != null && (
          <div>
            <dt>Diferencia entre tiendas</dt>
            <dd>{money(diff)}{pct != null ? ` · ${pct}%` : ''}</dd>
          </div>
        )}
      </dl>
      <div className="cw-opp-meta">
        <span className="cw-badge exact">{deal.match_label || 'Exacto por EAN'}</span>
        {deal.n_tiendas ? <span className="cw-muted">{plural(deal.n_tiendas, 'tienda')}</span> : null}
      </div>
      <p className="cw-disclaimer-text">Datos del último snapshot ({SNAPSHOT_FECHA}).</p>
      <button type="button" className="cw-small-btn" onClick={onDemo}>Agregar a una compra</button>
    </article>
  );
}

export function HowItWorksSection() {
  const steps = [
    {n: 1, title: 'Busca productos', desc: 'Encuentra alimentos y bebidas disponibles en supermercados cubiertos.', icon: <Search size={22} aria-hidden="true" />},
    {n: 2, title: 'Compara tu compra', desc: 'Cartwise calcula el total estimado por supermercado.', icon: <ShoppingBasket size={22} aria-hidden="true" />},
    {n: 3, title: 'Compra mejor', desc: 'Recibe una recomendación clara según precio y cobertura.', icon: <CheckCircle2 size={22} aria-hidden="true" />},
  ];
  return (
    <section className="cw-landing-section" aria-labelledby="cw-how-title">
      <h2 id="cw-how-title">Cómo funciona en 3 pasos</h2>
      <ol className="cw-how-steps" role="list">
        {steps.map((step) => (
          <li key={step.n} className="cw-how-step">
            <span className="cw-how-icon">{step.icon}</span>
            <strong>{step.n}. {step.title}</strong>
            <p>{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PublicDataDisclaimer() {
  return (
    <div className="cw-public-disclaimer">
      <Tag size={16} aria-hidden="true" />
      <p>{TRANSPARENCY_SNAPSHOT} La disponibilidad puede cambiar en tienda.</p>
    </div>
  );
}
