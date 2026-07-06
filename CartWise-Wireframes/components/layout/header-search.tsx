"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { usePendingPurchase } from "@/components/state/pending-purchase-provider";
import { searchExactProducts } from "@/lib/api";
import { sortImageFirst } from "@/lib/basket";
import { money } from "@/lib/format";
import type { SearchItem } from "@/types/cartwise";

/*
  Buscador global del header (estilo Lider): input real con autosugerencias.
  Elegir una sugerencia abre el detalle del producto ahí mismo; Enter (o "Ver
  todos los resultados") lleva a /productos?q=…, que es la grilla de resultados.
  Es EL buscador de la app: /productos ya no tiene input propio y lee q de la URL.
*/
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToBasket } = usePendingPurchase();

  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<SearchItem | null>(null);

  const reqId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado inicial desde la URL (p. ej. al recargar /productos?q=arroz).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce de la búsqueda.
  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Autosugerencias.
  useEffect(() => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    const id = ++reqId.current;
    // Solo productos exactos: la comparación por unidad quedó fuera del flujo.
    searchExactProducts(term, 10)
      .then((exact) => {
        if (id !== reqId.current) return;
        setSuggestions(sortImageFirst(exact).slice(0, 8));
      })
      .catch(() => {
        if (id === reqId.current) setSuggestions([]);
      });
  }, [term]);

  // En /productos el buscador filtra la grilla en vivo vía la URL.
  useEffect(() => {
    if (pathname !== "/productos") return;
    const current = new URLSearchParams(window.location.search).get("q") ?? "";
    if (current.trim() === term) return;
    router.replace(term ? `/productos?q=${encodeURIComponent(term)}` : "/productos", { scroll: false });
  }, [term, pathname, router]);

  const goToResults = () => {
    const q = query.trim();
    setOpen(false);
    inputRef.current?.blur();
    if (q.length < 2) return;
    if (pathname !== "/productos") {
      router.push(`/productos?q=${encodeURIComponent(q)}`);
    } else {
      router.replace(`/productos?q=${encodeURIComponent(q)}`, { scroll: false });
    }
  };

  const openFromSuggestion = (item: SearchItem) => {
    setOpen(false);
    setDetail(item);
  };

  const hasSearch = term.length >= 2;
  const showDropdown = useMemo(
    () => open && hasSearch && suggestions.length > 0,
    [open, hasSearch, suggestions],
  );

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToResults();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Buscar productos"
          aria-label="Buscar productos"
          className="h-11 w-full rounded-full border border-border bg-muted/50 pl-5 pr-20 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={goToResults}
          aria-label="Ver resultados de la búsqueda"
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Search className="size-4" />
        </button>

        {/* Dropdown de autosugerencias */}
        {showDropdown && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl">
            {suggestions.map((item) => (
              <li key={`sug-${item.kind}-${item.id}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => openFromSuggestion(item)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-accent"
                >
                  <div className="size-9 shrink-0 rounded-md bg-white p-1">
                    <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{item.nombre}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[item.marca, item.categoria].filter(Boolean).join(" · ") || "Producto"}
                    </span>
                  </span>
                  {item.precio_min != null && (
                    <span className="cw-price shrink-0 text-sm font-bold text-foreground">
                      {money(item.precio_min)}
                    </span>
                  )}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={goToResults}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-t border-border px-2 py-2 text-sm font-semibold text-primary hover:bg-accent"
              >
                <Search className="size-4" /> Ver todos los resultados de “{term}”
              </button>
            </li>
          </ul>
        )}
      </div>

      <ProductDetailDialog item={detail} onClose={() => setDetail(null)} onAddBasket={addToBasket} />
    </div>
  );
}
