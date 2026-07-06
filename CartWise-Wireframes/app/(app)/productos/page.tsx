"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, PackageSearch } from "lucide-react";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { usePurchaseHistory } from "@/components/state/purchase-history-provider";
import { usePantry } from "@/components/state/pantry-provider";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { BrowseDeals } from "@/components/product/browse-deals";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogFacets, getStrongDeals, searchExactProducts } from "@/lib/api";
import { isStrongDifference, sortImageFirst } from "@/lib/basket";
import { generalCategory, GENERAL_CATEGORY_ORDER } from "@/lib/categories";
import { normalizeText } from "@/lib/text";
import { money } from "@/lib/format";
import { COVERED_STORES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

const ALL = "__all__";

// useSearchParams exige un límite de Suspense al prerenderizar.
export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      }
    >
      <ProductosContent />
    </Suspense>
  );
}

function ProductosContent() {
  const { addToBasket } = usePendingPurchase();
  const { confirmed } = usePurchaseHistory();
  const { pantry } = usePantry();

  // El término viene del buscador global del header vía la URL (?q=…).
  const searchParams = useSearchParams();
  const term = (searchParams.get("q") ?? "").trim();
  const hasSearch = term.length >= 2;

  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SearchItem | null>(null);

  // Catálogo de exploración (diferencias destacadas) cuando no hay búsqueda.
  const [browse, setBrowse] = useState<SearchItem[] | null>(null);
  const [browseError, setBrowseError] = useState(false);

  // Marcas reales del catálogo comparable (para el filtro de marca).
  const [catalogBrands, setCatalogBrands] = useState<string[]>([]);

  // Filtros estilo supermercado.
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [brand, setBrand] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [onlyStrong, setOnlyStrong] = useState(false);
  const [onlyMultiStore, setOnlyMultiStore] = useState(false);
  const [seals, setSeals] = useState<Set<string>>(new Set());

  const reqId = useRef(0);

  const purchasedNames = useMemo(
    () => new Set(confirmed.flatMap((c) => c.items.map((i) => normalizeText(i.productName)))),
    [confirmed],
  );
  const pantryNames = useMemo(
    () => new Set(pantry.map((p) => normalizeText(p.productName))),
    [pantry],
  );

  useEffect(() => {
    let active = true;
    getStrongDeals(400)
      .then((items) => active && setBrowse(items))
      .catch(() => active && setBrowseError(true));
    getCatalogFacets()
      .then((facets) => active && setCatalogBrands(facets.brands))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasSearch) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    // Solo productos exactos: la comparación por unidad quedó fuera del flujo.
    searchExactProducts(term, 36)
      .then((exact) => {
        if (id !== reqId.current) return;
        setResults(sortImageFirst(exact));
      })
      .catch((e) => {
        if (id !== reqId.current) return;
        setError(e instanceof Error ? e.message : "No se pudo buscar.");
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [term, hasSearch]);

  const tagsFor = (item: SearchItem) => {
    const t: string[] = [];
    if (purchasedNames.has(normalizeText(item.nombre))) t.push("Comprado antes");
    if (pantryNames.has(normalizeText(item.nombre))) t.push("En despensa");
    return t;
  };

  // Marcas: catálogo real + las presentes en los resultados actuales.
  const brandOptions = useMemo(() => {
    const set = new Set(catalogBrands);
    for (const r of results) if (r.marca) set.add(r.marca);
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [catalogBrands, results]);

  // Techo del slider según el modo activo (resultados o exploración).
  const activeItems = hasSearch ? results : (browse ?? []);
  const priceCeiling = useMemo(
    () => Math.max(1000, ...activeItems.map((r) => r.precio_min ?? 0)),
    [activeItems],
  );

  const effMin = minPrice ?? 0;
  const effMax = maxPrice ?? priceCeiling;

  // Predicado único de filtros: se aplica a los resultados de búsqueda y al
  // modo exploración. Precio solo cuando el usuario movió el slider.
  const matchesFilters = useMemo(() => {
    return (item: SearchItem) => {
      if (item.precio_min != null) {
        if (minPrice != null && item.precio_min < minPrice) return false;
        if (maxPrice != null && item.precio_min > maxPrice) return false;
      }
      if (brand !== ALL && item.marca !== brand) return false;
      if (category !== ALL && generalCategory(item.categoria) !== category) return false;
      if (storeFilter && item.precio_min_store_label !== storeFilter) return false;
      if (onlyStrong && !isStrongDifference(item)) return false;
      if (onlyMultiStore && (item.n_tiendas ?? 0) < 2) return false;
      if (seals.has("Comprado antes") && !purchasedNames.has(normalizeText(item.nombre))) return false;
      if (seals.has("En despensa") && !pantryNames.has(normalizeText(item.nombre))) return false;
      return true;
    };
  }, [minPrice, maxPrice, brand, category, storeFilter, onlyStrong, onlyMultiStore, seals, purchasedNames, pantryNames]);

  const filtered = useMemo(() => results.filter(matchesFilters), [results, matchesFilters]);

  const anyFilter =
    minPrice != null ||
    maxPrice != null ||
    brand !== ALL ||
    category !== ALL ||
    storeFilter !== null ||
    onlyStrong ||
    onlyMultiStore ||
    seals.size > 0;

  const clearFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setBrand(ALL);
    setCategory(ALL);
    setStoreFilter(null);
    setOnlyStrong(false);
    setOnlyMultiStore(false);
    setSeals(new Set());
  };

  const toggleSeal = (seal: string) =>
    setSeals((prev) => {
      const next = new Set(prev);
      if (next.has(seal)) next.delete(seal);
      else next.add(seal);
      return next;
    });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Productos"
        description="Busca desde la barra superior como en un supermercado online y compara precios entre tiendas."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Panel de filtros */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <SlidersHorizontal className="size-4" /> Filtros
                </span>
                {anyFilter && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Precio (rango con mínimo y máximo) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Rango de precio
                  </span>
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>{money(effMin)}</span>
                    <span>{money(effMax)}</span>
                  </div>
                  <label className="sr-only" htmlFor="price-min">Precio mínimo</label>
                  <input
                    id="price-min"
                    type="range"
                    min={0}
                    max={priceCeiling}
                    step={500}
                    value={effMin}
                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), effMax))}
                    className="w-full accent-[var(--primary)]"
                  />
                  <label className="sr-only" htmlFor="price-max">Precio máximo</label>
                  <input
                    id="price-max"
                    type="range"
                    min={0}
                    max={priceCeiling}
                    step={500}
                    value={effMax}
                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), effMin))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>

                {/* Marca (todas las del catálogo comparable) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Marca</span>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas las marcas</SelectItem>
                      {brandOptions.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Categoría general (todas, no solo las de los resultados) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Categoría</span>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas las categorías</SelectItem>
                      {GENERAL_CATEGORY_ORDER.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supermercado (más barato en) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Más barato en
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COVERED_STORES.map((store) => (
                      <FilterChip
                        key={store}
                        active={storeFilter === store}
                        onClick={() => setStoreFilter(storeFilter === store ? null : store)}
                      >
                        {store}
                      </FilterChip>
                    ))}
                  </div>
                </div>

                {/* Etiquetas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Etiquetas</span>
                  <div className="flex flex-col gap-1.5">
                    <FilterChip active={onlyStrong} onClick={() => setOnlyStrong((v) => !v)}>
                      Solo diferencias destacadas
                    </FilterChip>
                    <FilterChip active={onlyMultiStore} onClick={() => setOnlyMultiStore((v) => !v)}>
                      Disponible en varias tiendas
                    </FilterChip>
                    <FilterChip active={seals.has("Comprado antes")} onClick={() => toggleSeal("Comprado antes")}>
                      Comprado antes
                    </FilterChip>
                    <FilterChip active={seals.has("En despensa")} onClick={() => toggleSeal("En despensa")}>
                      En despensa
                    </FilterChip>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Resultados (o catálogo de exploración si aún no hay búsqueda) */}
          <div className="space-y-4">
            {!hasSearch ? (
              <BrowseDeals
                deals={browse}
                error={browseError}
                matches={anyFilter ? matchesFilters : undefined}
                onAdd={addToBasket}
                onOpenDetail={setDetail}
              />
            ) : loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <EmptyState icon={PackageSearch} title="No se pudo buscar" description={error} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Sin resultados"
                description="Prueba con otro nombre o ajusta los filtros."
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} resultados para{" "}
                  <span className="font-semibold text-foreground">“{term}”</span>
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((item) => (
                    <ProductCard
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      onAdd={addToBasket}
                      onOpenDetail={setDetail}
                      tags={tagsFor(item)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
      </div>

      <ProductDetailDialog item={detail} onClose={() => setDetail(null)} onAddBasket={addToBasket} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
