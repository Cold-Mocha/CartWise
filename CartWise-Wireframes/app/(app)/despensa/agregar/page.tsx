"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Minus, Search, Check, X, ArrowLeft, ShoppingBasket } from "lucide-react";
import { usePantry } from "@/components/state/pantry-provider";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { searchExactProducts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Página propia (no modal) para agregar productos a la despensa (plan §6.2):
  buscar en el catálogo real, seleccionar varios (marcados en verde), indicar
  cantidad y agregarlos de una vez. Vuelve a la despensa al terminar.
*/
export default function AgregarDespensaPage() {
  const router = useRouter();
  const { addProductsToPantry } = usePantry();

  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Map<string, SearchItem>>(new Map());
  const [qty, setQty] = useState<Record<string, number>>({});
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    searchExactProducts(term, 24)
      .then((items) => id === reqId.current && setResults(items))
      .catch(() => id === reqId.current && setResults([]))
      .finally(() => id === reqId.current && setLoading(false));
  }, [term]);

  const keyOf = (item: SearchItem) => `${item.kind}-${item.id}`;

  const toggle = (item: SearchItem) => {
    const k = keyOf(item);
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(k)) next.delete(k);
      else next.set(k, item);
      return next;
    });
    setQty((prev) => ({ ...prev, [k]: prev[k] ?? 1 }));
  };

  const setQuantity = (k: string, value: number) => {
    setQty((prev) => ({ ...prev, [k]: Math.max(1, value) }));
  };

  const confirm = () => {
    if (!selected.size) return;
    addProductsToPantry([...selected.values()], qty);
    router.push("/despensa");
  };

  const selectedList = [...selected.values()];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Despensa"
        title="Agregar productos a la despensa"
        description="Busca en el catálogo, selecciona los que ya tienes en casa e indica la cantidad."
        action={
          <Button asChild variant="outline">
            <Link href="/despensa">
              <ArrowLeft /> Volver a la despensa
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Buscador + resultados */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos del catálogo…"
              className="h-12 pl-9"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            {term.length < 2 ? (
              <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Escribe para buscar productos del catálogo.
              </p>
            ) : loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : results.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Sin resultados.
              </p>
            ) : (
              results.map((item) => {
                const isSel = selected.has(keyOf(item));
                return (
                  <button
                    key={keyOf(item)}
                    type="button"
                    onClick={() => toggle(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                      isSel ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className="size-11 shrink-0 rounded-md bg-white p-1">
                      <ProductImage ean={item.ean} alt={item.nombre} category={item.categoria} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[item.marca, item.categoria].filter(Boolean).join(" · ") || "Producto"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border",
                        isSel ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {isSel && <Check className="size-4" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Panel de seleccionados */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <ShoppingBasket className="size-4 text-primary" /> Seleccionados
              <Badge variant="savings" className="ml-auto">
                {selectedList.length}
              </Badge>
            </p>
            <div className="min-h-[120px] flex-1 space-y-2 overflow-y-auto">
              {selectedList.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Aún no seleccionas productos.
                </p>
              ) : (
                selectedList.map((item) => {
                  const k = keyOf(item);
                  return (
                    <div key={k} className="rounded-md bg-card p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                          {item.nombre}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggle(item)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Quitar ${item.nombre}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <div className="mt-1.5 inline-flex items-center rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => setQuantity(k, (qty[k] ?? 1) - 1)}
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold tabular-nums">{qty[k] ?? 1}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(k, (qty[k] ?? 1) + 1)}
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Button className="mt-3 w-full" disabled={!selectedList.length} onClick={confirm}>
              <Plus /> Agregar a la despensa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
