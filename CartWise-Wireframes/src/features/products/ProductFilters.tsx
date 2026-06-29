import type {MatchFilter} from '../../domain/types';

export function ProductFilters({
  matchFilter,
  onMatchFilter,
  minTwoStores,
  onMinTwoStores,
  availableOnly,
  onAvailableOnly,
  categoryFilter,
  onCategoryFilter,
  storeFilter,
  onStoreFilter,
  categories,
  stores,
}: {
  matchFilter: MatchFilter;
  onMatchFilter: (value: MatchFilter) => void;
  minTwoStores: boolean;
  onMinTwoStores: (value: boolean) => void;
  availableOnly: boolean;
  onAvailableOnly: (value: boolean) => void;
  categoryFilter: string;
  onCategoryFilter: (value: string) => void;
  storeFilter: string;
  onStoreFilter: (value: string) => void;
  categories: string[];
  stores: string[];
}) {
  return (
    <div className="cw-filters" aria-label="Filtros de búsqueda">
      <div className="cw-segmented" role="group" aria-label="Tipo de resultado">
        {[
          ['all', 'Todos'],
          ['product', 'Exactos'],
          ['generic', 'Comparables'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={matchFilter === id ? 'active' : ''}
            aria-pressed={matchFilter === id}
            onClick={() => onMatchFilter(id as MatchFilter)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="cw-check">
        <input
          type="checkbox"
          checked={minTwoStores}
          onChange={(event) => onMinTwoStores(event.target.checked)}
        />
        2+ tiendas
      </label>
      <label className="cw-check">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(event) => onAvailableOnly(event.target.checked)}
        />
        Disponible
      </label>
      <label className="cw-select-field">
        Categoría
        <select value={categoryFilter} onChange={(event) => onCategoryFilter(event.target.value)}>
          <option value="all">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="cw-select-field">
        Tienda precio mínimo
        <select value={storeFilter} onChange={(event) => onStoreFilter(event.target.value)}>
          <option value="all">Todas</option>
          {stores.map((store) => (
            <option key={store} value={store}>{store}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
