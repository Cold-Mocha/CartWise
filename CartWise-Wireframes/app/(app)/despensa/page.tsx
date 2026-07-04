"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBasket, Minus, Plus, CheckCheck, Truck, Hand, Search, Store } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StoreLogo } from "@/components/brand/store-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { money, plural, shortDate } from "@/lib/format";
import { normalizeText } from "@/lib/text";
import type { PantryItem, SearchItem } from "@/types/cartwise";

export default function DespensaPage() {
  const { pantry, updatePantryQuantity, consumePantryItem, addToBasket } = useAppState();
  const [search, setSearch] = useState("");

  const addButton = (
    <Button asChild>
      <Link href="/despensa/agregar">
        <Plus /> Agregar producto
      </Link>
    </Button>
  );

  const visible = useMemo(() => {
    const q = normalizeText(search);
    if (!q) return pantry;
    return pantry.filter((p) => normalizeText(p.productName).includes(q));
  }, [pantry, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, PantryItem[]>();
    for (const item of visible) {
      const cat = item.category?.trim() || "Otros";
      map.set(cat, [...(map.get(cat) ?? []), item]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const totalUnits = pantry.reduce((s, p) => s + p.quantity, 0);

  // Reconstruye un SearchItem mínimo para agregar a la compra pendiente desde la
  // despensa (solo si guardamos el id de producto y el mejor precio al agregar).
  const toBasket = (item: PantryItem) => {
    if (item.productId == null) return;
    const searchItem: SearchItem = {
      id: item.productId,
      kind: "product",
      ean: item.ean ?? null,
      nombre: item.productName,
      marca: null,
      categoria: item.category ?? null,
      precio_min: item.bestPrice ?? null,
      precio_min_store_label: item.bestPriceStore ?? null,
      match_label: "Exacto por EAN",
    };
    addToBasket(searchItem);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Almacén del hogar"
        title="Despensa"
        description="Lleva el control de lo que ya tienes en casa."
        action={addButton}
      />

      {/* Buscador interno de la despensa */}
      {pantry.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en mi despensa…"
            className="pl-9"
            aria-label="Buscar en mi despensa"
          />
        </div>
      )}

      {pantry.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {plural(pantry.length, "producto")} · {plural(totalUnits, "unidad", "unidades")} en casa
        </p>
      )}

      {pantry.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Tu despensa está vacía"
          description="Agrega productos que ya tienes en casa, o envíalos automáticamente al confirmar una compra."
          action={addButton}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin coincidencias"
          description="Ningún producto de tu despensa coincide con la búsqueda."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {category}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{items.length}</span>
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <PantryCard
                    key={item.id}
                    item={item}
                    onInc={() => updatePantryQuantity(item.id, item.quantity + 1)}
                    onDec={() => updatePantryQuantity(item.id, item.quantity - 1)}
                    onConsume={() => consumePantryItem(item.id)}
                    onAddToBasket={() => toBasket(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function PantryCard({
  item,
  onInc,
  onDec,
  onConsume,
  onAddToBasket,
}: {
  item: PantryItem;
  onInc: () => void;
  onDec: () => void;
  onConsume: () => void;
  onAddToBasket: () => void;
}) {
  const hasPrice = item.productId != null && item.bestPrice != null;

  return (
    <Card className="group relative">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-foreground">{item.productName}</h3>
            <p className="text-xs text-muted-foreground">
              {item.category?.trim() || "Otros"} · actualizado {shortDate(item.updatedAt)}
            </p>
          </div>
          <Badge variant={item.source === "confirmed_purchase" ? "savings" : "muted"}>
            {item.source === "confirmed_purchase" ? (
              <>
                <Truck className="size-3" /> Compra
              </>
            ) : (
              <>
                <Hand className="size-3" /> Manual
              </>
            )}
          </Badge>
        </div>

        {item.notes && <p className="text-xs italic text-muted-foreground">{item.notes}</p>}

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={onDec}
              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-9 text-center text-sm font-bold tabular-nums">
              {item.quantity}
              {item.unit ? ` ${item.unit}` : ""}
            </span>
            <button
              type="button"
              onClick={onInc}
              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <Button size="sm" variant="ghost" className="text-primary" onClick={onConsume}>
            <CheckCheck /> Consumido
          </Button>
        </div>

        {/* Acción al hover: mejor precio + agregar a compra pendiente (plan §6.4) */}
        <div className="space-y-2 border-t border-border pt-3 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {hasPrice ? (
            <>
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                {item.bestPriceStore ? <StoreLogo name={item.bestPriceStore} size={18} /> : <Store className="size-3.5" />}
                Mejor precio:{" "}
                <span className="cw-price font-bold text-foreground">{money(item.bestPrice)}</span>
                {item.bestPriceStore ? ` en ${item.bestPriceStore}` : ""}
              </p>
              <Button size="sm" variant="outline" className="w-full" onClick={onAddToBasket}>
                <Plus /> Agregar a compra pendiente
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Sin precio disponible en el último snapshot.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
