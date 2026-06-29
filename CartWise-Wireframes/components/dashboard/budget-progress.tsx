"use client";

import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
  Gasto registrado del mes vs presupuesto mensual (plan §2). El presupuesto es un
  valor demo editable del estado local; el gasto sale de las compras confirmadas
  del mes. No promete precios en tiempo real: es el registro del usuario.
*/
export function BudgetProgress({
  spent,
  budget,
}: {
  spent: number;
  budget: number;
}) {
  const safeBudget = budget > 0 ? budget : 1;
  const pct = Math.round((spent / safeBudget) * 100);
  const remaining = budget - spent;
  const over = remaining < 0;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Gasto del mes vs presupuesto</p>
              <p className="text-xs text-muted-foreground">Presupuesto mensual {money(budget)}</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-extrabold",
              over ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
            )}
          >
            {pct}%
          </span>
        </div>

        <p className="text-lg font-bold text-foreground">
          Llevas <span className="cw-price text-primary">{money(spent)}</span> de{" "}
          <span className="cw-price">{money(budget)}</span> este mes
        </p>

        <Progress
          value={Math.min(100, pct)}
          indicatorClassName={over ? "bg-destructive" : "bg-primary"}
        />

        <p className={cn("text-sm font-semibold", over ? "text-destructive" : "text-muted-foreground")}>
          {over
            ? `Te pasaste por ${money(Math.abs(remaining))} del presupuesto`
            : `Te quedan ${money(remaining)}`}
        </p>
      </CardContent>
    </Card>
  );
}
