"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, PackageSearch, X } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { BrowseCarousels } from "@/components/product/browse-carousels";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { TransparencyNote } from "@/components/common/transparency-note";
import { StoreCoverage } from "@/components/store/store-coverage";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { searchExactProducts, searchGenericProducts } from "@/lib/api";
import { isStrongDifference } from "@/lib/basket";
import { normalizeText } from "@/lib/text";
import { money } from "@/lib/format";
import { SUGERENCIAS, COVERED_STORES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

const ALL = "__all__";

export default function ProductosPage() {
  const { addToBasket, addProductsToPantry, confirmed, pantry } = useAppState();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SearchItem | null>(null);

  // Filtros estilo supermercado.
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [brand, setBrand] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [onlyStrong, setOnlyStrong] = useState(false);
  const [onlyMultiStore, setOnlyMultiStore] = useState(false);
  const [seals, setSeals] = useState<Set<string>>(new Set());

  const reqId = useRef(0);

  // Nombres comprados / en despensa para sellos derivados.
  const purchasedNames = useMemo(
    () => new Set(confirmed.flatMap((c) => c.items.map((i) => normalizeText(i.productName)))),
    [confirmed],
  );
  const pantryNames = useMemo(
    () => new Set(pantry.map((p) => normalizeText(p.productName))),
    [pantry],
  );
  const purchasedCategories = useMemo(
    () =>
      Array.from(
        new Set(
          confirmed.flatMap((c) => c.items.map((i) => i.category).filter(Boolean) as string[]),
        ),
      ),
    [confirmed],
  );

  // Debounce de la búsqueda.
  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (term.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    Promise.all([searchExactProducts(term, 24), searchGenericProducts(term, 12)])
      .then(([exact, generic]) => {
        if (id !== reqId.current) return;
        setResults([...exact, ...generic]);
      })
      .catch((e) => {
        if (id !== reqId.current) return;
        setError(e instanceof Error ? e.message : "No se pudo buscar.");
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [term]);

  const tagsFor = (item: SearchItem) => {
    const t: string[] = [];
    if (purchasedNames.has(normalizeText(item.nombre))) t.push("Comprado antes");
    if (pantryNames.has(normalizeText(item.nombre))) t.push("En despensa");
    return t;
  };

  // Opciones de marca y categoría presentes en los resultados.
  const brandOptions = useMemo(
    () => Array.from(new Set(results.map((r) => r.marca).filter(Boolean) as string[])).sort(),
    [results],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(results.map((r) => r.categoria).filter(Boolean) as string[])).sort(),
    [results],
  );
  const priceCeiling = useMemo(
    () => Math.max(0, ...results.map((r) => r.precio_min ?? 0)),
    [results],
  );

  const filtered = useMemo(() => {
    return results.filter((item) => {
      if (maxPrice != null && item.precio_min != null && item.precio_min > maxPrice) return false;
      if (brand !== ALL && item.marca !== brand) return false;
      if (category !== ALL && item.categoria !== category) return false;
      if (storeFilter && item.precio_min_store_label !== storeFilter) return false;
      if (onlyStrong && !isStrongDifference(item)) return false;
      if (onlyMultiStore && (item.n_tiendas ?? 0) < 2) return false;
      if (seals.has("Comprado antes") && !purchasedNames.has(normalizeText(item.nombre))) return false;
      if (seals.has("En despensa") && !pantryNames.has(normalizeText(item.nombre))) return false;
      return true;
    });
  }, [results, maxPrice, brand, category, storeFilter, onlyStrong, onlyMultiStore, seals, purchasedNames, pantryNames]);

  const hasSearch = term.length >= 2;
  const anyFilter =
    maxPrice != null ||
    brand !== ALL ||
    category !== ALL ||
    storeFilter !== null ||
    onlyStrong ||
    onlyMultiStore ||
    seals.size > 0;

  const clearFilters = () => {
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
        eyebrow="Catálogo"
        title="Productos"
        description="Busca como en un supermercado online y compara precios entre las tiendas cubiertas."
      />

      {/* Buscador grande */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o marca: leche, arroz, aceite, cerveza…"
          className="h-14 rounded-xl pl-12 pr-12 text-base shadow-sm"
          aria-label="Buscar productos"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Sugerencias rápidas */}
      <div className="flex flex-wrap gap-2">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuery(s)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>

      {!hasSearch ? (
        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Supermercados cubiertos
            </p>
            <StoreCoverage />
          </div>
          <BrowseCarousels
            purchasedCategories={purchasedCategories}
            onOpenDetail={setDetail}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Panel de filtros */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-4">
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
                {/* Precio */}
                <div className="space-y-2">
                  <label htmlFor="price" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Precio máximo
                  </label>
                  <input
                    id="price"
                    type="range"
                    min={0}
                    max={Math.max(1000, priceCeiling)}
                    step={500}
                    value={maxPrice ?? Math.max(1000, priceCeiling)}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hasta{" "}
                    <span className="font-semibold text-foreground">
                      {money(maxPrice ?? Math.max(1000, priceCeiling))}
                    </span>
                  </p>
                </div>

                {/* Marca */}
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

                {/* Categoría */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Categoría</span>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas las categorías</SelectItem>
                      {categoryOptions.map((c) => (
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

                {/* Sellos / etiquetas */}
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

          {/* Resultados */}
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-lg" />
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
                <TransparencyNote />
              </>
            )}
          </div>
        </div>
      )}

      <ProductDetailDialog
        item={detail}
        onClose={() => setDetail(null)}
        onAddBasket={addToBasket}
        onAddPantry={(item) => addProductsToPantry([item])}
      />
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
