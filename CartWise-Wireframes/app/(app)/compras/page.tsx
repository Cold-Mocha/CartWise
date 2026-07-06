"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CircleCheck,
  CircleX,
  ClipboardList,
  History,
  Repeat,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { usePurchaseHistory } from "@/components/state/purchase-history-provider";
import { usePlanWorkflows } from "@/hooks/use-plan-workflows";
import { ConfirmPurchaseDialog } from "@/components/history/confirm-purchase-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { ProductImage } from "@/components/product/product-image";
import { StoreLogo } from "@/components/brand/store-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, shortDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConfirmedPurchase, SavedPlan } from "@/types/cartwise";

/*
  Compras: todo el ciclo después de confirmar un plan. Arriba, las compras
  pendientes (planes creados que aún no se compran) con sus acciones; abajo,
  el historial de compras ya confirmadas. Al confirmar una pendiente se
  pregunta cuánto se pagó y qué productos se encontraron, y la compra pasa
  al historial.
*/

export default function ComprasPage() {
  const { hydrated, history, confirmed, highlightedPlanId, deletePlan, deletePurchase } =
    usePurchaseHistory();
  const { confirmPurchase, repeatPlan } = usePlanWorkflows();

  const [confirming, setConfirming] = useState<SavedPlan | null>(null);
  const [selected, setSelected] = useState<ConfirmedPurchase | null>(null);

  // Evita el parpadeo del estado vacío mientras se lee lo persistido.
  if (!hydrated) return null;

  // Pendientes: planes aún no comprados. Historial: compras confirmadas,
  // de la más reciente a la más antigua.
  const pendientes = history.filter((p) => p.status !== "purchased");
  const purchases = [...confirmed].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Plan de origen de una compra: aporta las imágenes y líneas del momento
  // en que se creó.
  const planFor = (purchase: ConfirmedPurchase) =>
    history.find((p) => p.id === purchase.planId) ?? null;

  const selectedPlan = selected ? planFor(selected) : null;

  // Detalle de la compra al estilo "Confirmar compra": el plan original
  // completo, marcando qué se encontró y qué no (lo que no está entre los
  // items confirmados). Compras antiguas sin plan caen a solo lo comprado.
  const detailEntries =
    selected == null
      ? []
      : selectedPlan?.recommendedLines?.length
        ? selectedPlan.recommendedLines.map((r) => {
            const line = selectedPlan.lines?.find((l) => l.id === r.itemId && l.kind === r.kind);
            const name = r.matchedProductName || r.name;
            return {
              key: `${r.kind}-${r.itemId}`,
              name,
              quantity: r.quantity,
              store: r.storeLabel ?? selectedPlan.store,
              ean: r.ean ?? line?.ean,
              category: line?.categoria ?? null,
              price: r.price != null ? r.price * r.quantity : null,
              found: selected.items.some((it) => it.productName === name),
            };
          })
        : selected.items.map((it, i) => ({
            key: `${it.productName}-${i}`,
            name: it.productName,
            quantity: it.quantity,
            store: it.store ?? selected.store,
            ean: it.ean,
            category: it.category ?? null,
            price: it.paidPrice != null ? it.paidPrice * it.quantity : null,
            found: true,
          }));

  // Agrupadas por tienda planificada, preservando el orden de aparición.
  const detailGroups = detailEntries.reduce<{ store: string; items: typeof detailEntries }[]>(
    (groups, entry) => {
      const group = groups.find((g) => g.store === entry.store);
      if (group) group.items.push(entry);
      else groups.push({ store: entry.store, items: [entry] });
      return groups;
    },
    [],
  );

  if (pendientes.length === 0 && purchases.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading title="Compras" />
        <EmptyState
          icon={ShoppingBag}
          title="Aún no tienes compras"
          description="Arma tu carrito, compara precios y confirma un plan para verlo aquí."
          action={
            <Button asChild>
              <Link href="/productos">
                <Search /> Armar una compra
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Compras"
        description="Tus compras pendientes por confirmar y el historial de lo que ya compraste."
      />

      {/* Compras pendientes: planes creados que todavía no se compran */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Compras pendientes</h3>
          <span className="text-sm text-muted-foreground">({pendientes.length})</span>
        </div>

        {pendientes.length === 0 ? (
          <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">
            No tienes compras pendientes. Confirma un plan desde la comparación para verlo aquí.
          </Card>
        ) : (
          <div className="space-y-3">
            {pendientes.map((plan) => (
              <Card
                key={plan.id}
                className={
                  highlightedPlanId === plan.id ? "border-primary ring-2 ring-primary/30" : ""
                }
              >
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-[160px] flex-1">
                    <p className="text-base font-extrabold text-foreground">{plan.store}</p>
                    <p className="text-xs text-muted-foreground">
                      {shortDate(plan.createdAt) || plan.date} · {plural(plan.items, "producto")}
                    </p>
                  </div>
                  <p className="cw-price text-lg font-extrabold text-foreground">
                    {money(plan.total)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" onClick={() => setConfirming(plan)}>
                      <BadgeCheck /> Confirmar compra
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deletePlan(plan.id)}
                      aria-label="Eliminar compra pendiente"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Historial: compras ya confirmadas */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Historial</h3>
          <span className="text-sm text-muted-foreground">({purchases.length})</span>
        </div>

        {purchases.length === 0 ? (
          <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">
            Cuando confirmes una compra pendiente aparecerá aquí.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => {
              // Miniaturas de lo realmente comprado; el plan de origen aporta
              // la imagen si el item confirmado no guardó EAN (datos antiguos).
              const planLines = planFor(purchase)?.lines ?? [];
              const thumbs = purchase.items.map((item) => {
                const line = planLines.find((l) => l.nombre === item.productName);
                return {
                  key: item.productName,
                  ean: item.ean ?? line?.ean,
                  category: item.category ?? line?.categoria,
                };
              });
              return (
                <div key={purchase.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelected(purchase)}
                    className="h-full w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Card className="h-full rounded-2xl p-4 transition-all hover:border-primary/40 hover:shadow-md">
                      <div className="flex items-center gap-3 pr-9">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <ShoppingBag className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-foreground">
                            {shortDate(purchase.purchaseDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plural(purchase.items.length, "producto")}
                          </p>
                        </div>
                      </div>

                      {/* Miniaturas de los productos comprados */}
                      {thumbs.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5">
                          {thumbs.slice(0, 4).map((thumb) => (
                            <span
                              key={thumb.key}
                              className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"
                            >
                              <ProductImage
                                ean={thumb.ean}
                                alt={thumb.key}
                                category={thumb.category}
                                className="size-8 object-contain"
                              />
                            </span>
                          ))}
                          {thumbs.length > 4 && (
                            <span className="text-xs font-semibold text-muted-foreground">
                              +{thumbs.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-end justify-between gap-2 border-t border-border/60 pt-3">
                        <span className="text-xs text-muted-foreground">Total compra</span>
                        <span className="cw-price text-xl font-extrabold text-primary">
                          {money(purchase.realTotal)}
                        </span>
                      </div>
                    </Card>
                  </button>

                  {/* Borrar la compra del historial (fuera del botón clickeable) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 text-destructive"
                    onClick={() => deletePurchase(purchase.id)}
                    aria-label="Eliminar compra del historial"
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmPurchaseDialog
        plan={confirming}
        onClose={() => setConfirming(null)}
        onConfirm={confirmPurchase}
      />

      {/* Detalle del plan creado en ese momento */}
      <Dialog open={selected != null} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de la compra</DialogTitle>
                <DialogDescription>
                  Comprada el {shortDate(selected.purchaseDate)}
                  {selectedPlan ? ` · plan creado el ${selectedPlan.date}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl bg-primary px-4 py-3 text-center text-primary-foreground">
                <p className="text-xs font-medium text-primary-foreground/80">Total compra</p>
                <p className="cw-price text-2xl font-bold tracking-tight">
                  {money(selected.realTotal)}
                </p>
                <p className="text-xs text-primary-foreground/80">
                  {plural(selected.items.length, "producto")}
                </p>
              </div>

              {/* Productos por supermercado, marcando encontrados y no encontrados */}
              <div className="space-y-4">
                {detailGroups.map((group) => (
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
                      {group.items.map((item) => (
                        <li
                          key={item.key}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3",
                            item.found ? "border-primary/40 bg-primary/5" : "border-border opacity-70",
                          )}
                        >
                          {item.found ? (
                            <CircleCheck className="size-5 shrink-0 text-savings" />
                          ) : (
                            <CircleX className="size-5 shrink-0 text-destructive" />
                          )}
                          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                            <ProductImage
                              ean={item.ean}
                              alt={item.name}
                              category={item.category}
                              className="size-11 object-contain"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-[15px] leading-snug text-foreground",
                                !item.found && "line-through",
                              )}
                            >
                              {item.name}{" "}
                              <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                            </span>
                            {!item.found && (
                              <span className="mt-0.5 block text-xs font-semibold text-destructive">
                                No encontrado
                              </span>
                            )}
                          </span>
                          {item.price != null && (
                            <span
                              className={cn(
                                "cw-price shrink-0 text-base font-semibold",
                                item.found ? "text-foreground" : "text-muted-foreground line-through",
                              )}
                            >
                              {money(item.price)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Repetir: regenera la comparación con los mismos productos y
                  lleva a /comparar, sin tocar el carrito en curso. */}
              <DialogFooter>
                <Button
                  disabled={!selectedPlan?.lines?.length}
                  onClick={() => {
                    const plan = selectedPlan;
                    setSelected(null);
                    if (plan) repeatPlan(plan);
                  }}
                >
                  <Repeat /> Repetir
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
