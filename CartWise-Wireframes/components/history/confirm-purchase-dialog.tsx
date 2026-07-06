"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImage } from "@/components/product/product-image";
import { StoreLogo } from "@/components/brand/store-logo";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConfirmPurchaseData, SavedPlan } from "@/types/cartwise";

// Modal para confirmar una compra: por cada producto, agrupado por la tienda
// donde se planificó comprarlo, se pregunta si se encontró ahí, y cuánto se
// pagó en total. Solo lo marcado como encontrado pasa al historial (con su
// tienda). La lista completa se ve de una vez: el único scroll es el del
// propio modal. Controlado vía `plan` (null = cerrado).
export function ConfirmPurchaseDialog({
  plan,
  onClose,
  onConfirm,
}: {
  plan: SavedPlan | null;
  onClose: () => void;
  onConfirm: (plan: SavedPlan, data: ConfirmPurchaseData) => void;
}) {
  return (
    <Dialog open={plan !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        {plan && (
          // key: reinicia el formulario al confirmar un plan distinto.
          <ConfirmPurchaseForm key={plan.id} plan={plan} onClose={onClose} onConfirm={onConfirm} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmPurchaseForm({
  plan,
  onClose,
  onConfirm,
}: {
  plan: SavedPlan;
  onClose: () => void;
  onConfirm: (plan: SavedPlan, data: ConfirmPurchaseData) => void;
}) {
  // Productos del plan con el precio y la tienda donde se planificó comprarlos.
  const allItems = (plan.lines ?? []).map((line) => {
    const recommended = plan.recommendedLines?.find(
      (r) => r.itemId === line.id && r.kind === line.kind,
    );
    return {
      key: `${line.kind}-${line.id}`,
      productName: recommended?.matchedProductName || line.nombre,
      quantity: line.quantity,
      category: line.categoria ?? null,
      paidPrice: recommended?.price ?? line.precio_min ?? null,
      ean: line.ean,
      // Planes antiguos sin tienda por línea caen a la etiqueta del plan.
      store: recommended?.storeLabel ?? plan.store,
    };
  });

  // Agrupados por tienda planificada, preservando el orden de aparición.
  const storeGroups = allItems.reduce<{ store: string; items: typeof allItems }[]>(
    (groups, item) => {
      const group = groups.find((g) => g.store === item.store);
      if (group) group.items.push(item);
      else groups.push({ store: item.store, items: [item] });
      return groups;
    },
    [],
  );

  const [found, setFound] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(allItems.map((i) => [i.key, true])),
  );
  const [realTotal, setRealTotal] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));

  const foundItems = allItems.filter((i) => found[i.key]);
  // Estimado solo de lo encontrado: referencia y respaldo si no ingresan total.
  const estimatedFound = foundItems.reduce(
    (sum, i) => sum + (i.paidPrice ?? 0) * i.quantity,
    0,
  );

  const submit = () => {
    const parsed = Number(realTotal.replace(/[^\d]/g, ""));
    onConfirm(plan, {
      realTotal: Number.isFinite(parsed) && parsed > 0 ? parsed : estimatedFound,
      purchaseDate,
      items: foundItems.map(({ productName, quantity, category, paidPrice, ean, store }) => ({
        productName,
        quantity,
        category,
        paidPrice,
        ean,
        store,
      })),
      addToPantry: false,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirmar compra</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Por tienda planificada: ¿encontraste cada producto ahí? La lista
            completa se muestra sin scroll propio. */}
        <div className="space-y-3">
          <Label>¿Encontraste cada producto donde lo planificaste?</Label>
          <div className="space-y-4">
            {storeGroups.map((group) => (
              <div key={group.store}>
                <div className="flex items-center gap-2.5 pb-2">
                  <StoreLogo
                    name={group.store}
                    size={30}
                    className="rounded-full ring-1 ring-border"
                  />
                  <span className="text-base font-bold text-foreground">{group.store}</span>
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => {
                    const checked = found[item.key];
                    return (
                      <li key={item.key}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                            checked ? "border-primary/40 bg-primary/5" : "border-border opacity-60",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setFound((prev) => ({ ...prev, [item.key]: e.target.checked }))
                            }
                            className="size-4 shrink-0 accent-[var(--primary)]"
                          />
                          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                            <ProductImage
                              ean={item.ean}
                              alt={item.productName}
                              category={item.category}
                              className="size-11 object-contain"
                            />
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 text-[15px] leading-snug text-foreground",
                              !checked && "line-through",
                            )}
                          >
                            {item.productName}{" "}
                            <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          </span>
                          {item.paidPrice != null && (
                            <span className="cw-price shrink-0 text-base font-semibold text-foreground">
                              {money(item.paidPrice * item.quantity)}
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="real-total">¿Cuánto pagaste en total?</Label>
          <Input
            id="real-total"
            inputMode="numeric"
            value={realTotal}
            onChange={(e) => setRealTotal(e.target.value)}
            placeholder={String(estimatedFound)}
          />
          <p className="text-xs text-muted-foreground">
            Déjalo vacío para usar el estimado de lo encontrado ({money(estimatedFound)}).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase-date">Fecha de compra</Label>
          <Input
            id="purchase-date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={foundItems.length === 0}>
          <BadgeCheck /> Confirmar compra
        </Button>
      </DialogFooter>
    </>
  );
}
