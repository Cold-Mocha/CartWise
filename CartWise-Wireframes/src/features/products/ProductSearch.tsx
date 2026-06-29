import {Fragment, useState, type FormEvent} from 'react';
import {Search} from 'lucide-react';
import {SUGERENCIAS} from '../../domain/constants';
import type {MatchFilter, SearchItem} from '../../domain/types';
import {isAvailableFlag} from '../../lib/basket';
import {searchExactProducts, searchGenericProducts} from '../../services/cartwiseApi';
import {EmptyState, PanelHeader} from '../../components/ui';
import {ProductFilters} from './ProductFilters';
import {SearchResultCard} from './SearchResultCard';

export function ProductSearch({
  onAdd,
  variant = 'basket',
}: {
  onAdd: (item: SearchItem) => void;
  variant?: 'basket' | 'explore';
}) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [exact, setExact] = useState<SearchItem[]>([]);
  const [generic, setGeneric] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [minTwoStores, setMinTwoStores] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const runSearch = async (term: string) => {
    const q = term.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setSubmitted(q);
    try {
      const exactLimit = variant === 'explore' ? 18 : 12;
      const genericLimit = variant === 'explore' ? 10 : 6;
      const [exactItems, genericItems] = await Promise.all([
        searchExactProducts(q, exactLimit),
        searchGenericProducts(q, genericLimit),
      ]);
      setExact(exactItems);
      setGeneric(genericItems);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de busqueda');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    runSearch(query);
  };

  const pickSuggestion = (term: string) => {
    setQuery(term);
    runSearch(term);
  };

  const allResults = [...exact, ...generic];
  const categories = Array.from(
    new Set(allResults.map((item) => item.categoria).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'es'));
  const stores = Array.from(
    new Set(allResults.map((item) => item.precio_min_store_label).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'es'));
  const passesFilters = (item: SearchItem) => {
    if (matchFilter !== 'all' && item.kind !== matchFilter) return false;
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false;
    if (storeFilter !== 'all' && item.precio_min_store_label !== storeFilter) return false;
    if (minTwoStores && (item.n_tiendas ?? 0) < 2) return false;
    if (availableOnly && !isAvailableFlag(item.precio_min_disponible)) return false;
    return true;
  };
  const filteredExact = exact.filter(passesFilters);
  const filteredGeneric = generic.filter(passesFilters);
  const rawTotal = exact.length + generic.length;
  const total = filteredExact.length + filteredGeneric.length;

  return (
    <section className="cw-panel">
      <PanelHeader title="Buscar producto" subtitle="Busca por nombre o marca y agrégalo a tu compra." />
      <form className="cw-searchbar" onSubmit={onSubmit} role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busca por nombre, marca o código de barras"
          aria-label="Buscar producto por nombre o marca"
        />
        <button className="cw-primary-btn" disabled={loading || !query.trim()}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      <div className="cw-suggestions">
        <span>Sugerencias:</span>
        {SUGERENCIAS.map((s) => (
          <button key={s} type="button" className="cw-chip-btn" onClick={() => pickSuggestion(s)}>
            {s}
          </button>
        ))}
      </div>
      {variant === 'explore' && searched && (
        <ProductFilters
          matchFilter={matchFilter}
          onMatchFilter={setMatchFilter}
          minTwoStores={minTwoStores}
          onMinTwoStores={setMinTwoStores}
          availableOnly={availableOnly}
          onAvailableOnly={setAvailableOnly}
          categoryFilter={categoryFilter}
          onCategoryFilter={setCategoryFilter}
          storeFilter={storeFilter}
          onStoreFilter={setStoreFilter}
          categories={categories}
          stores={stores}
        />
      )}
      {error && <div className="cw-form-error" role="alert">{error}</div>}
      <p className="cw-sr-only" aria-live="polite">
        {loading
          ? 'Buscando...'
          : searched
            ? total
              ? `${total} resultados para «${submitted}»`
              : rawTotal
                ? `Sin resultados para «${submitted}» con los filtros activos`
                : `Sin resultados para «${submitted}»`
            : ''}
      </p>
      <div className={`cw-search-results${loading ? ' loading' : ''}`} aria-busy={loading}>
        {!searched && !loading && (
          <EmptyState text="Busca un producto o elige una sugerencia para ver precios reales." />
        )}
        {searched && rawTotal === 0 && !loading && (
          <EmptyState text={`Sin resultados para «${submitted}». Prueba con otro término.`} />
        )}
        {searched && rawTotal > 0 && total === 0 && !loading && (
          <EmptyState text="No hay resultados con los filtros activos." />
        )}
        {filteredExact.length > 0 && (
          <div className="cw-result-group">
            <h3 className="cw-result-group-title">Mismo producto</h3>
            <div className="cw-result-list" role="list">
              {filteredExact.map((item) => (
                <Fragment key={`product-${item.id}`}>
                  <SearchResultCard item={item} onAdd={onAdd} />
                </Fragment>
              ))}
            </div>
          </div>
        )}
        {filteredGeneric.length > 0 && (
          <div className="cw-result-group">
            <h3 className="cw-result-group-title">Comparables por unidad</h3>
            <div className="cw-result-list" role="list">
              {filteredGeneric.map((item) => (
                <Fragment key={`generic-${item.id}`}>
                  <SearchResultCard item={item} onAdd={onAdd} />
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
