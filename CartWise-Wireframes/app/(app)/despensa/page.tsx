"use client";

import { useMemo } from "react";
import { ShoppingBasket, Minus, Plus, CheckCheck, Truck, Hand } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { AddPantryDialog } from "@/components/pantry/add-pantry-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plural, shortDate } from "@/lib/format";

export default function DespensaPage() {
  const { pantry, addPantryItem, updatePantryQuantity, consumePantryItem } = useAppState();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof pantry>();
    for (const item of pantry) {
      const cat = item.category?.trim() || "Otros";
      map.set(cat, [...(map.get(cat) ?? []), item]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [pantry]);

  const totalUnits = pantry.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Almacén del hogar"
        title="Despensa"
        description={
          pantry.length
            ? `${plural(pantry.length, "producto")} · ${plural(totalUnits, "unidad", "unidades")} en casa`
            : "Lleva el control de lo que ya tienes en casa."
        }
        action={<AddPantryDialog onAdd={addPantryItem} />}
      />

      {pantry.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Tu despensa está vacía"
          description="Agrega productos que ya tienes en casa, o envíalos automáticamente al confirmar una compra."
          action={<AddPantryDialog onAdd={addPantryItem} />}
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
                  <Card key={item.id}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-foreground">{item.productName}</h3>
                          <p className="text-xs text-muted-foreground">Actualizado {shortDate(item.updatedAt)}</p>
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
                            onClick={() => updatePantryQuantity(item.id, item.quantity - 1)}
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
                            onClick={() => updatePantryQuantity(item.id, item.quantity + 1)}
                            className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary"
                          onClick={() => consumePantryItem(item.id)}
                        >
                          <CheckCheck /> Consumido
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
