"use client";

import { useState } from "react";
import { BadgeCheck, ShoppingBasket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/lib/format";
import type { ConfirmPurchaseData, ConfirmedPurchaseItem, SavedPlan } from "@/types/cartwise";

// Modal para confirmar una compra: total real pagado, fecha y si se envían los
// productos a la despensa (plan §13.7). Controlado vía `plan` (null = cerrado).
export function ConfirmPurchaseDialog({
  plan,
  onClose,
  onConfirm,
}: {
  plan: SavedPlan | null;
  onClose: () => void;
  onConfirm: (plan: SavedPlan, data: ConfirmPurchaseData) => void;
}) {
  const [realTotal, setRealTotal] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addToPantry, setAddToPantry] = useState(true);

  const open = plan !== null;

  const items: ConfirmedPurchaseItem[] = (plan?.lines ?? []).map((line) => {
    const recommended = plan?.recommendedLines?.find((r) => r.itemId === line.id && r.kind === line.kind);
    return {
      productName: recommended?.matchedProductName || line.nombre,
      quantity: line.quantity,
      category: line.categoria ?? null,
      paidPrice: recommended?.price ?? line.precio_min ?? null,
    };
  });

  const submit = () => {
    if (!plan) return;
    const parsed = Number(realTotal.replace(/[^\d]/g, ""));
    onConfirm(plan, {
      realTotal: Number.isFinite(parsed) && parsed > 0 ? parsed : plan.total,
      purchaseDate,
      items,
      addToPantry,
    });
    setRealTotal("");
    setAddToPantry(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar compra</DialogTitle>
          <DialogDescription>
            {plan && (
              <>
                Plan en <span className="font-semibold text-foreground">{plan.store}</span> · estimado{" "}
                {money(plan.total)}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="real-total">Total realmente pagado</Label>
            <Input
              id="real-total"
              inputMode="numeric"
              value={realTotal}
              onChange={(e) => setRealTotal(e.target.value)}
              placeholder={plan ? String(plan.total) : "0"}
            />
            <p className="text-xs text-muted-foreground">
              Déjalo vacío para usar el total estimado ({plan ? money(plan.total) : "—"}).
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

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <input
              type="checkbox"
              checked={addToPantry}
              onChange={(e) => setAddToPantry(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShoppingBasket className="size-4 text-primary" /> Agregar productos a mi despensa
              </span>
              <span className="text-muted-foreground">
                Suma {items.length} productos al almacén del hogar.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>
            <BadgeCheck /> Confirmar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
