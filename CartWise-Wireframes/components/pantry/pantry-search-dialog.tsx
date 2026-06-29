"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search, Check, X, ShoppingBasket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { searchExactProducts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types/cartwise";

/*
  Nuevo flujo para llenar la despensa (plan §6.2): el usuario busca en el catálogo
  real, selecciona varios productos (marcados en verde), los ve en un panel
  "Seleccionados" y los agrega de una vez. No es un formulario manual.
*/
export function PantrySearchDialog({
  onAddMany,
}: {
  onAddMany: (items: SearchItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Map<string, SearchItem>>(new Map());
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
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
  }, [term, open]);

  const keyOf = (item: SearchItem) => `${item.kind}-${item.id}`;

  const toggle = (item: SearchItem) =>
    setSelected((prev) => {
      const next = new Map(prev);
      const k = keyOf(item);
      if (next.has(k)) next.delete(k);
      else next.set(k, item);
      return next;
    });

  const confirm = () => {
    if (!selected.size) return;
    onAddMany([...selected.values()]);
    setSelected(new Map());
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const selectedList = [...selected.values()];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSelected(new Map());
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus /> Agregar producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Agregar productos a la despensa</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          {/* Buscador + resultados */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos del catálogo…"
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {term.length < 2 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Escribe para buscar productos del catálogo.
                </p>
              ) : loading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
              ) : results.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados.</p>
              ) : (
                results.map((item) => {
                  const isSel = selected.has(keyOf(item));
                  return (
                    <button
                      key={keyOf(item)}
                      type="button"
                      onClick={() => toggle(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                        isSel
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <div className="size-10 shrink-0 rounded-md bg-white p-1">
                        <ProductImage ean={item.ean} alt={item.nombre} className="h-full w-full" />
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
          <div className="flex flex-col rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <ShoppingBasket className="size-4 text-primary" /> Seleccionados
              <Badge variant="savings" className="ml-auto">
                {selectedList.length}
              </Badge>
            </p>
            <div className="min-h-[120px] flex-1 space-y-1.5 overflow-y-auto">
              {selectedList.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Aún no seleccionas productos.
                </p>
              ) : (
                selectedList.map((item) => (
                  <div
                    key={keyOf(item)}
                    className="flex items-center gap-1.5 rounded-md bg-card px-2 py-1.5 text-xs"
                  >
                    <span className="min-w-0 flex-1 truncate text-foreground">{item.nombre}</span>
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Quitar ${item.nombre}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <Button className="mt-3 w-full" disabled={!selectedList.length} onClick={confirm}>
              <Plus /> Agregar a la despensa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
