"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { money, shortDate } from "@/lib/format";
import type { SavedPlan } from "@/types/cartwise";

// Detalle de un plan guardado: líneas recomendadas con precio y faltantes.
export function PlanDetailDialog({ plan, onClose }: { plan: SavedPlan | null; onClose: () => void }) {
  const open = plan !== null;
  const lines = plan?.recommendedLines ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle del plan</DialogTitle>
          <DialogDescription>
            {plan && (
              <>
                {plan.store} · {shortDate(plan.createdAt) || plan.date} · estimado {money(plan.total)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este plan no guardó el detalle de líneas.</p>
          ) : (
            lines.map((line) => (
              <div
                key={`${line.kind}-${line.itemId}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{line.name}</p>
                  <p className="text-xs text-muted-foreground">×{line.quantity}</p>
                </div>
                {line.price != null ? (
                  <span className="flex items-center gap-2">
                    <Badge variant="savings">
                      <Check className="size-3" /> Disponible
                    </Badge>
                    <span className="cw-price text-sm font-bold text-foreground">{money(line.lineTotal)}</span>
                  </span>
                ) : (
                  <Badge variant="missing">
                    <X className="size-3" /> Sin precio
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
