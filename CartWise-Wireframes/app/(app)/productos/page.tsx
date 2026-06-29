"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, PackageSearch, TrendingDown, X } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { TransparencyNote } from "@/components/common/transparency-note";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchExactProducts, searchGenericProducts } from "@/lib/api";
import { isStrongDifference } from "@/lib/basket";
import { SUGERENCIAS, CATEGORIAS_DESTACADAS, COVERED_STORES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MatchFilter, SearchItem } from "@/types/cartwise";

export default function ProductosPage() {
  const { addToBasket } = useAppState();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [onlyStrong, setOnlyStrong] = useState(false);

  const reqId = useRef(0);

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
    Promise.all([searchExactProducts(term, 16), searchGenericProducts(term, 10)])
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

  const filtered = useMemo(() => {
    return results.filter((item) => {
      if (matchFilter !== "all" && item.kind !== matchFilter) return false;
      if (storeFilter && item.precio_min_store_label !== storeFilter) return false;
      if (onlyStrong && !isStrongDifference(item)) return false;
      return true;
    });
  }, [results, matchFilter, storeFilter, onlyStrong]);

  const hasSearch = term.length >= 2;
  const anyFilter = matchFilter !== "all" || storeFilter !== null || onlyStrong;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Catálogo"
        title="Busca productos"
        description="Encuentra productos por nombre o marca en los supermercados cubiertos y agrégalos a tu compra."
      />

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar leche, arroz, aceite, cerveza…"
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

      {/* Sugerencias / categorías rápidas */}
      <div className="flex flex-wrap gap-2">
        {(hasSearch ? CATEGORIAS_DESTACADAS : SUGERENCIAS).map((s) => (
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

      {/* Filtros */}
      {hasSearch && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <SlidersHorizontal className="size-3.5" /> Filtros
          </span>
          <FilterChip active={matchFilter === "all"} onClick={() => setMatchFilter("all")}>
            Todos
          </FilterChip>
          <FilterChip active={matchFilter === "product"} onClick={() => setMatchFilter("product")}>
            Exacto por EAN
          </FilterChip>
          <FilterChip active={matchFilter === "generic"} onClick={() => setMatchFilter("generic")}>
            Comparable
          </FilterChip>
          <span className="mx-1 h-5 w-px bg-border" />
          {COVERED_STORES.map((store) => (
            <FilterChip
              key={store}
              active={storeFilter === store}
              onClick={() => setStoreFilter(storeFilter === store ? null : store)}
            >
              {store}
            </FilterChip>
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          <FilterChip active={onlyStrong} onClick={() => setOnlyStrong((v) => !v)}>
            <TrendingDown className="size-3.5" /> Diferencia destacada
          </FilterChip>
          {anyFilter && (
            <button
              type="button"
              onClick={() => {
                setMatchFilter("all");
                setStoreFilter(null);
                setOnlyStrong(false);
              }}
              className="ml-auto text-xs font-semibold text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Resultados */}
      {!hasSearch ? (
        <EmptyState
          icon={PackageSearch}
          title="Empieza a buscar"
          description="Escribe el nombre de un producto o elige una sugerencia para ver precios entre supermercados."
        />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={PackageSearch}
          title="No se pudo buscar"
          description={error}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Sin resultados"
          description="Prueba con otro nombre o revisa los filtros."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} resultados para <span className="font-semibold text-foreground">“{term}”</span>
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <ProductCard key={`${item.kind}-${item.id}`} item={item} onAdd={addToBasket} />
            ))}
          </div>
          <TransparencyNote />
        </>
      )}
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
